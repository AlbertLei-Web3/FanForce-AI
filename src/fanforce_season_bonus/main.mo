// FanForce AI - Season Bonus Pool Canister / FanForce AI - 赛季奖金池容器
// Internet Computer (ICP) Smart Contract for Athlete Season Bonuses / 用于运动员赛季奖金的互联网计算机智能合约
// This canister manages athlete season bonuses, replacing the Virtual CHZ concept / 此容器管理运动员赛季奖金，替换虚拟CHZ概念

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
actor class FanForceSeasonBonus() = {
    
    // ========== Type Definitions / 类型定义 ==========
    
    // Athlete profile structure / 运动员档案结构
    type AthleteProfile = {
        id: Text;                    // Unique athlete ID / 唯一运动员ID
        name: Text;                  // Athlete name / 运动员姓名
        studentId: Text;             // Student ID / 学号
        sport: Text;                 // Sport type / 运动类型
        position: Text;              // Position / 位置
        team: Text;                  // Team name / 队伍名称
        rank: Text;                  // Current rank / 当前等级
        rankPoints: Nat;             // Rank points / 等级积分
        status: Text;                // Current status / 当前状态
    };
    
    // Season bonus structure / 赛季奖金结构
    type SeasonBonus = {
        athleteId: Text;             // Athlete ID / 运动员ID
        seasonId: Text;              // Season ID / 赛季ID
        baseSalary: Float;           // Base monthly salary / 基础月薪
        performanceBonus: Float;     // Performance bonus / 表现奖金
        matchBonus: Float;           // Match participation bonus / 比赛参与奖金
        socialBonus: Float;          // Social media bonus / 社交媒体奖金
        totalBonus: Float;           // Total season bonus / 总赛季奖金
        claimed: Bool;               // Whether bonus has been claimed / 奖金是否已领取
        claimTime: ?Int;             // Claim timestamp / 领取时间戳
        seasonMatches: Nat;          // Number of matches in season / 赛季比赛数量
        socialPosts: Nat;            // Number of social posts / 社交媒体帖子数量
    };
    
    // Season structure / 赛季结构
    type Season = {
        id: Text;                    // Season ID / 赛季ID
        name: Text;                  // Season name / 赛季名称
        startDate: Int;              // Season start date / 赛季开始日期
        endDate: Int;                // Season end date / 赛季结束日期
        isActive: Bool;              // Whether season is active / 赛季是否活跃
        totalPool: Float;            // Total bonus pool / 总奖金池
        distributedPool: Float;      // Distributed bonus pool / 已分配奖金池
    };
    
    // ========== State Variables / 状态变量 ==========
    
    // Storage for athletes, bonuses, and seasons / 运动员、奖金和赛季的存储
    private stable var athleteProfiles: [(Text, AthleteProfile)] = [];
    private stable var seasonBonuses: [(Text, SeasonBonus)] = [];
    private stable var seasons: [(Text, Season)] = [];
    
    // Mutable storage / 可变存储
    private var athletes = HashMap.HashMap<Text, AthleteProfile>(0, Text.equal, Text.hash);
    private var bonuses = HashMap.HashMap<Text, SeasonBonus>(0, Text.equal, Text.hash);
    private var seasonData = HashMap.HashMap<Text, Season>(0, Text.equal, Text.hash);
    
    // Admin principal / 管理员主体
    private let admin: Principal = Principal.fromText("2vxsx-fae"); // Default admin / 默认管理员
    
    // ========== System Functions / 系统函数 ==========
    
    // System preupgrade function / 系统升级前函数
    system func preupgrade() {
        athleteProfiles := Iter.toArray(athletes.entries());
        seasonBonuses := Iter.toArray(bonuses.entries());
        seasons := Iter.toArray(seasonData.entries());
    };
    
    // System postupgrade function / 系统升级后函数
    system func postupgrade() {
        athletes := HashMap.fromIter<Text, AthleteProfile>(athleteProfiles.vals(), 0, Text.equal, Text.hash);
        bonuses := HashMap.fromIter<Text, SeasonBonus>(seasonBonuses.vals(), 0, Text.equal, Text.hash);
        seasonData := HashMap.fromIter<Text, Season>(seasons.vals(), 0, Text.equal, Text.hash);
        athleteProfiles := [];
        seasonBonuses := [];
        seasons := [];
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
            totalPool = totalPool;
            distributedPool = 0.0;
        };
        
        seasonData.put(seasonId, newSeason);
        #ok("Season created successfully")
    };
    
    // ========== Athlete Management Functions / 运动员管理函数 ==========
    
    // Register a new athlete / 注册新运动员
    public shared({caller}) func registerAthlete(
        athleteId: Text,
        name: Text,
        studentId: Text,
        sport: Text,
        position: Text,
        team: Text
    ) : async Result.Result<Text, Text> {
        if (athletes.get(athleteId) != null) {
            return #err("Athlete already registered");
        };
        
        let newAthlete: AthleteProfile = {
            id = athleteId;
            name = name;
            studentId = studentId;
            sport = sport;
            position = position;
            team = team;
            rank = "Bronze";
            rankPoints = 0;
            status = "resting";
        };
        
        athletes.put(athleteId, newAthlete);
        #ok("Athlete registered successfully")
    };
    
    // Update athlete profile / 更新运动员档案
    public shared({caller}) func updateAthleteProfile(
        athleteId: Text,
        rank: ?Text,
        rankPoints: ?Nat,
        status: ?Text
    ) : async Result.Result<Text, Text> {
        switch (athletes.get(athleteId)) {
            case null { #err("Athlete not found") };
            case (?athlete) {
                let updatedAthlete: AthleteProfile = {
                    id = athlete.id;
                    name = athlete.name;
                    studentId = athlete.studentId;
                    sport = athlete.sport;
                    position = athlete.position;
                    team = athlete.team;
                    rank = Option.get(rank, athlete.rank);
                    rankPoints = Option.get(rankPoints, athlete.rankPoints);
                    status = Option.get(status, athlete.status);
                };
                athletes.put(athleteId, updatedAthlete);
                #ok("Athlete profile updated successfully")
            };
        };
    };
    
    // ========== Season Bonus Functions / 赛季奖金函数 ==========
    
    // Calculate and assign season bonus / 计算并分配赛季奖金
    public shared({caller}) func assignSeasonBonus(
        athleteId: Text,
        seasonId: Text,
        baseSalary: Float,
        seasonMatches: Nat,
        socialPosts: Nat
    ) : async Result.Result<Text, Text> {
        if (not isAdmin(caller)) {
            return #err("Unauthorized: Only admin can assign bonuses");
        };
        
        if (athletes.get(athleteId) == null) {
            return #err("Athlete not found");
        };
        
        if (seasonData.get(seasonId) == null) {
            return #err("Season not found");
        };
        
        // Calculate performance bonuses / 计算表现奖金
        let matchBonus: Float = Float.fromInt(Int.fromNat(seasonMatches)) * 10.0; // 10 ICP per match / 每场比赛10 ICP
        let socialBonus: Float = Float.fromInt(Int.fromNat(socialPosts)) * 5.0;   // 5 ICP per post / 每个帖子5 ICP
        let performanceBonus: Float = matchBonus + socialBonus;
        let totalBonus: Float = baseSalary + performanceBonus;
        
        let seasonBonus: SeasonBonus = {
            athleteId = athleteId;
            seasonId = seasonId;
            baseSalary = baseSalary;
            performanceBonus = performanceBonus;
            matchBonus = matchBonus;
            socialBonus = socialBonus;
            totalBonus = totalBonus;
            claimed = false;
            claimTime = null;
            seasonMatches = seasonMatches;
            socialPosts = socialPosts;
        };
        
        let bonusKey = athleteId # "_" # seasonId;
        bonuses.put(bonusKey, seasonBonus);
        
        #ok("Season bonus assigned successfully")
    };
    
    // Claim season bonus / 领取赛季奖金
    public shared({caller}) func claimSeasonBonus(
        athleteId: Text,
        seasonId: Text
    ) : async Result.Result<Text, Text> {
        let bonusKey = athleteId # "_" # seasonId;
        
        switch (bonuses.get(bonusKey)) {
            case null { #err("Season bonus not found") };
            case (?bonus) {
                if (bonus.claimed) {
                    return #err("Bonus already claimed");
                };
                
                let updatedBonus: SeasonBonus = {
                    athleteId = bonus.athleteId;
                    seasonId = bonus.seasonId;
                    baseSalary = bonus.baseSalary;
                    performanceBonus = bonus.performanceBonus;
                    matchBonus = bonus.matchBonus;
                    socialBonus = bonus.socialBonus;
                    totalBonus = bonus.totalBonus;
                    claimed = true;
                    claimTime = ?Time.now();
                    seasonMatches = bonus.seasonMatches;
                    socialPosts = bonus.socialPosts;
                };
                
                bonuses.put(bonusKey, updatedBonus);
                #ok("Season bonus claimed successfully")
            };
        };
    };
    
    // ========== Query Functions / 查询函数 ==========
    
    // Get athlete profile / 获取运动员档案
    public query func getAthleteProfile(athleteId: Text) : async ?AthleteProfile {
        athletes.get(athleteId)
    };
    
    // Get season bonus / 获取赛季奖金
    public query func getSeasonBonus(athleteId: Text, seasonId: Text) : async ?SeasonBonus {
        let bonusKey = athleteId # "_" # seasonId;
        bonuses.get(bonusKey)
    };
    
    // Get all athletes / 获取所有运动员
    public query func getAllAthletes() : async [AthleteProfile] {
        Iter.toArray(athletes.vals())
    };
    
    // Get all season bonuses for an athlete / 获取运动员的所有赛季奖金
    public query func getAthleteBonuses(athleteId: Text) : async [SeasonBonus] {
        let athleteBonuses = Array.filter<SeasonBonus>(
            Iter.toArray(bonuses.vals()),
            func (bonus: SeasonBonus) : Bool { bonus.athleteId == athleteId }
        );
        athleteBonuses
    };
    
    // Get season information / 获取赛季信息
    public query func getSeason(seasonId: Text) : async ?Season {
        seasonData.get(seasonId)
    };
    
    // Get all seasons / 获取所有赛季
    public query func getAllSeasons() : async [Season] {
        Iter.toArray(seasonData.vals())
    };
    
    // Get canister statistics / 获取容器统计信息
    public query func getCanisterStats() : async {
        totalAthletes: Nat;
        totalBonuses: Nat;
        totalSeasons: Nat;
        totalDistributed: Float;
    } {
        {
            totalAthletes = athletes.size();
            totalBonuses = bonuses.size();
            totalSeasons = seasonData.size();
            totalDistributed = 0.0; // Would calculate from claimed bonuses / 将从已领取奖金计算
        }
    };
}; 