// FanForce AI - Athlete Bonus MVP Canister / FanForce AI - 运动员奖金MVP容器
// Simple MVP canister for athlete season bonuses / 运动员赛季奖金的简单MVP容器
// This canister manages season creation, eligibility checking, and bonus claiming / 此容器管理赛季创建、资格检查和奖金领取

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Error "mo:base/Error";
import Result "mo:base/Result";

// Main canister actor / 主容器actor
actor class AthleteBonusMVP() = {
    
    // ========== Type Definitions / 类型定义 ==========
    
    // Season structure / 赛季结构
    type Season = {
        id: Text;                    // Season ID / 赛季ID
        name: Text;                  // Season name / 赛季名称
        startDate: Int;              // Season start date / 赛季开始日期
        endDate: Int;                // Season end date / 赛季结束日期
        isActive: Bool;              // Whether season is active / 赛季是否活跃
        requiredMatches: Nat;        // Required matches for bonus / 奖金所需比赛数量
        bonusAmount: Float;          // Bonus amount in ICP / ICP奖金金额
        totalPool: Float;            // Total bonus pool / 总奖金池
        distributedPool: Float;      // Distributed bonus pool / 已分配奖金池
    };
    
    // Athlete claim structure / 运动员领取结构
    type AthleteClaim = {
        athleteId: Text;             // Athlete ID / 运动员ID
        seasonId: Text;              // Season ID / 赛季ID
        claimed: Bool;               // Whether bonus has been claimed / 奖金是否已领取
        claimTime: ?Int;             // Claim timestamp / 领取时间戳
        matchCount: Nat;             // Number of matches participated / 参与比赛数量
        bonusAmount: Float;          // Actual bonus amount claimed / 实际领取的奖金金额
    };
    
    // ========== State Variables / 状态变量 ==========
    
    // Storage for seasons and claims / 赛季和领取的存储
    private stable var seasons: [(Text, Season)] = [];
    private stable var claims: [(Text, AthleteClaim)] = [];
    
    // Mutable storage / 可变存储
    private var seasonData = HashMap.HashMap<Text, Season>(0, Text.equal, Text.hash);
    private var claimData = HashMap.HashMap<Text, AthleteClaim>(0, Text.equal, Text.hash);
    
    // Admin principal / 管理员主体
    private let admin: Principal = Principal.fromText("2vxsx-fae"); // Default admin / 默认管理员
    
    // ========== System Functions / 系统函数 ==========
    
    // System preupgrade function / 系统升级前函数
    system func preupgrade() {
        seasons := Iter.toArray(seasonData.entries());
        claims := Iter.toArray(claimData.entries());
    };
    
    // System postupgrade function / 系统升级后函数
    system func postupgrade() {
        seasonData := HashMap.fromIter<Text, Season>(seasons.vals(), 0, Text.equal, Text.hash);
        claimData := HashMap.fromIter<Text, AthleteClaim>(claims.vals(), 0, Text.equal, Text.hash);
        seasons := [];
        claims := [];
    };
    
    // ========== Admin Functions / 管理员函数 ==========
    
    // Check if caller is admin / 检查调用者是否为管理员
    private func isAdmin(caller: Principal) : Bool {
        Principal.equal(caller, admin)
    };
    
    // Create a new season / 创建新赛季
    public shared({caller}) func createSeason(
        seasonId: Text,
        name: Text,
        startDate: Int,
        endDate: Int,
        requiredMatches: Nat,
        bonusAmount: Float,
        totalPool: Float
    ) : async Result.Result<Text, Text> {
        if (not isAdmin(caller)) {
            return #err("Unauthorized: Only admin can create seasons");
        };
        
        if (seasonData.get(seasonId) != null) {
            return #err("Season already exists");
        };
        
        let newSeason: Season = {
            id = seasonId;
            name = name;
            startDate = startDate;
            endDate = endDate;
            isActive = true;
            requiredMatches = requiredMatches;
            bonusAmount = bonusAmount;
            totalPool = totalPool;
            distributedPool = 0.0;
        };
        
        seasonData.put(seasonId, newSeason);
        #ok("Season created successfully")
    };
    
    // ========== Athlete Functions / 运动员函数 ==========
    
    // Check athlete eligibility / 检查运动员资格
    public query func checkEligibility(
        athleteId: Text,
        seasonId: Text,
        matchCount: Nat
    ) : async Result.Result<{
        eligible: Bool;
        season: ?Season;
        reason: Text;
    }, Text> {
        // Find season / 查找赛季
        switch (seasonData.get(seasonId)) {
            case null { 
                #err("Season not found") 
            };
            case (?season) {
                if (not season.isActive) {
                    return #ok({
                        eligible = false;
                        season = ?season;
                        reason = "Season is not active";
                    });
                };
                
                // Check if already claimed / 检查是否已领取
                let claimKey = athleteId # "_" # seasonId;
                switch (claimData.get(claimKey)) {
                    case (?claim) {
                        if (claim.claimed) {
                            return #ok({
                                eligible = false;
                                season = ?season;
                                reason = "Bonus already claimed";
                            });
                        };
                    };
                    case null { };
                };
                
                // Check eligibility / 检查资格
                if (matchCount >= season.requiredMatches) {
                    #ok({
                        eligible = true;
                        season = ?season;
                        reason = "Eligible for bonus";
                    })
                } else {
                    #ok({
                        eligible = false;
                        season = ?season;
                        reason = "Not enough matches. Required: " # Nat.toText(season.requiredMatches) # ", Have: " # Nat.toText(matchCount);
                    })
                };
            };
        };
    };
    
    // Claim bonus / 领取奖金
    public shared({caller}) func claimBonus(
        athleteId: Text,
        seasonId: Text,
        matchCount: Nat
    ) : async Result.Result<Text, Text> {
        // Check eligibility first / 首先检查资格
        let eligibility = await checkEligibility(athleteId, seasonId, matchCount);
        
        switch (eligibility) {
            case (#err(msg)) { #err(msg) };
            case (#ok(result)) {
                if (not result.eligible) {
                    return #err(result.reason);
                };
                
                switch (result.season) {
                    case null { #err("Season not found") };
                    case (?season) {
                        // Check if enough pool remaining / 检查是否有足够的池剩余
                        if (season.distributedPool + season.bonusAmount > season.totalPool) {
                            return #err("Insufficient bonus pool");
                        };
                        
                        // Create claim record / 创建领取记录
                        let claim: AthleteClaim = {
                            athleteId = athleteId;
                            seasonId = seasonId;
                            claimed = true;
                            claimTime = ?Time.now();
                            matchCount = matchCount;
                            bonusAmount = season.bonusAmount;
                        };
                        
                        let claimKey = athleteId # "_" # seasonId;
                        claimData.put(claimKey, claim);
                        
                        // Update season distributed pool / 更新赛季已分配池
                        let updatedSeason: Season = {
                            id = season.id;
                            name = season.name;
                            startDate = season.startDate;
                            endDate = season.endDate;
                            isActive = season.isActive;
                            requiredMatches = season.requiredMatches;
                            bonusAmount = season.bonusAmount;
                            totalPool = season.totalPool;
                            distributedPool = season.distributedPool + season.bonusAmount;
                        };
                        seasonData.put(seasonId, updatedSeason);
                        
                        #ok("Bonus claimed successfully. Amount: " # Float.toText(season.bonusAmount) # " ICP")
                    };
                };
            };
        };
    };
    
    // ========== Query Functions / 查询函数 ==========
    
    // Get season information / 获取赛季信息
    public query func getSeason(seasonId: Text) : async ?Season {
        seasonData.get(seasonId)
    };
    
    // Get all seasons / 获取所有赛季
    public query func getAllSeasons() : async [Season] {
        Iter.toArray(seasonData.vals())
    };
    
    // Get athlete claim / 获取运动员领取
    public query func getAthleteClaim(athleteId: Text, seasonId: Text) : async ?AthleteClaim {
        let claimKey = athleteId # "_" # seasonId;
        claimData.get(claimKey)
    };
    
    // Get all claims / 获取所有领取
    public query func getAllClaims() : async [AthleteClaim] {
        Iter.toArray(claimData.vals())
    };
    
    // Get canister statistics / 获取容器统计信息
    public query func getCanisterStats() : async {
        totalSeasons: Nat;
        totalClaims: Nat;
        totalDistributed: Float;
        canisterId: Text;
    } {
        let totalDistributed = Array.foldLeft<AthleteClaim, Float>(
            Iter.toArray(claimData.vals()),
            0.0,
            func (acc: Float, claim: AthleteClaim) : Float { acc + claim.bonusAmount }
        );
        
        {
            totalSeasons = seasonData.size();
            totalClaims = claimData.size();
            totalDistributed = totalDistributed;
            canisterId = "athlete-bonus-mvp";
        }
    };
}; 