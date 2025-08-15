// FanForce AI - Verifier Canister Implementation / FanForce AI - 验证器容器实现
// Motoko implementation for ICP canister / ICP容器的Motoko实现
// This canister serves as: Identity Verifier + Operation Logger + Relationship Validator / 此容器作为：身份验证器 + 操作日志记录器 + 关系验证器

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";

// Main canister actor / 主容器actor
actor class FanForceVerifier() = {
    
    // ========== Type Definitions / 类型定义 ==========
    
    // User identity verification result / 用户身份验证结果
    type UserIdentity = {
        principalId: Text;
        isVerified: Bool;
        verificationTime: Nat64;
        lastActive: Nat64;
        role: Text;
        inviteCode: Text;
    };
    

    
    // Operation log entry / 操作日志条目
    type OperationLog = {
        id: Text;
        userId: Text;
        principalId: Text;
        action: Text;
        timestamp: Nat64;
        metadata: Text;
        txHash: Text;
        status: Text;
        blockHeight: Nat64;
    };
    
    // Invitation relationship record / 邀请关系记录
    type InvitationRelationship = {
        id: Text;
        inviterPrincipalId: Text;
        inviteePrincipalId: Text;
        inviteCode: Text;
        invitationTime: Nat64;
        relationshipType: Text;
        isActive: Bool;
    };
    
    // Achievement/badge verification record / 成就/徽章验证记录
    type AchievementVerification = {
        id: Text;
        userId: Text;
        principalId: Text;
        achievementType: Text;
        achievementId: Text;
        verificationTime: Nat64;
        metadata: Text;
        isVerified: Bool;
    };
    
    // Canister statistics / 容器统计信息
    type CanisterStats = {
        totalUsers: Nat64;
        totalOperations: Nat64;
        totalRelationships: Nat64;
        totalAchievements: Nat64;
        lastUpdate: Nat64;
    };
    
    // ========== State Variables / 状态变量 ==========
    
    // Storage for various data types / 各种数据类型的存储
    private stable var userIdentities: [(Text, UserIdentity)] = [];
    private stable var operationLogs: [(Text, OperationLog)] = [];
    private stable var invitationRelationships: [(Text, InvitationRelationship)] = [];
    private stable var achievementVerifications: [(Text, AchievementVerification)] = [];
    
    // Mutable storage / 可变存储
    private var users = HashMap.HashMap<Text, UserIdentity>(0, Text.equal, Text.hash);
    private var operations = HashMap.HashMap<Text, OperationLog>(0, Text.equal, Text.hash);
    private var relationships = HashMap.HashMap<Text, InvitationRelationship>(0, Text.equal, Text.hash);
    private var achievements = HashMap.HashMap<Text, AchievementVerification>(0, Text.equal, Text.hash);
    
    // Admin principal / 管理员主体
    private let admin: Principal = Principal.fromText("2vxsx-fae"); // Default admin / 默认管理员
    
    // Counter for generating unique IDs / 生成唯一ID的计数器
    private stable var operationCounter: Nat64 = 0;
    private stable var relationshipCounter: Nat64 = 0;
    private stable var achievementCounter: Nat64 = 0;
    
    // ========== System Functions / 系统函数 ==========
    
    // System preupgrade function / 系统升级前函数
    system func preupgrade() {
        userIdentities := Iter.toArray(users.entries());
        inviteCodes := Iter.toArray(codes.entries());
        operationLogs := Iter.toArray(operations.entries());
        invitationRelationships := Iter.toArray(relationships.entries());
        achievementVerifications := Iter.toArray(achievements.entries());
    };
    
    // System postupgrade function / 系统升级后函数
    system func postupgrade() {
        users := HashMap.fromIter<Text, UserIdentity>(userIdentities.vals(), 0, Text.equal, Text.hash);
        operations := HashMap.fromIter<Text, OperationLog>(operationLogs.vals(), 0, Text.equal, Text.hash);
        relationships := HashMap.fromIter<Text, InvitationRelationship>(invitationRelationships.vals(), 0, Text.equal, Text.hash);
        achievements := HashMap.fromIter<Text, AchievementVerification>(achievementVerifications.vals(), 0, Text.equal, Text.hash);
        userIdentities := [];
        operationLogs := [];
        invitationRelationships := [];
        achievementVerifications := [];
    };
    
    // ========== Helper Functions / 辅助函数 ==========
    
    // Check if caller is admin / 检查调用者是否为管理员
    private func isAdmin(caller: Principal) : Bool {
        Principal.equal(caller, admin)
    };
    
    // Generate unique operation ID / 生成唯一操作ID
    private func generateOperationId() : Text {
        operationCounter := operationCounter + 1;
        "op_" # Nat64.toText(operationCounter)
    };
    
    // Generate unique relationship ID / 生成唯一关系ID
    private func generateRelationshipId() : Text {
        relationshipCounter := relationshipCounter + 1;
        "rel_" # Nat64.toText(relationshipCounter)
    };
    
    // Generate unique achievement ID / 生成唯一成就ID
    private func generateAchievementId() : Text {
        achievementCounter := achievementCounter + 1;
        "ach_" # Nat64.toText(achievementCounter)
    };
    
    // Generate transaction hash / 生成交易哈希
    private func generateTxHash(caller: Principal) : Text {
        "tx_" # Int.toText(Time.now()) # "_" # Int.toText(Principal.hash(caller))
    };
    
    // ========== Identity Verification Methods / 身份验证方法 ==========
    
    // Verify user ICP identity / 验证用户ICP身份
    public shared({caller}) func verifyUserIdentity(principalId: Text) : async UserIdentity {
        let now = Time.now();
        
        // Check if user already exists / 检查用户是否已存在
        switch (users.get(principalId)) {
            case (?existingUser) {
                // Update last active time / 更新最后活跃时间
                let updatedUser: UserIdentity = {
                    principalId = existingUser.principalId;
                    isVerified = existingUser.isVerified;
                    verificationTime = existingUser.verificationTime;
                    lastActive = now;
                    role = existingUser.role;
                    inviteCode = existingUser.inviteCode;
                };
                users.put(principalId, updatedUser);
                updatedUser
            };
            case null {
                // Create new user identity / 创建新用户身份
                let newUser: UserIdentity = {
                    principalId = principalId;
                    isVerified = true;
                    verificationTime = now;
                    lastActive = now;
                    role = "audience"; // Default role / 默认角色
                    inviteCode = "FF-" # Text.substring(Principal.toText(caller), 0, 6);
                };
                users.put(principalId, newUser);
                newUser
            };
        }
    };
    

    
    // Check user operation permission / 检查用户操作权限
    public shared({caller}) func checkUserPermission(principalId: Text, action: Text, resource: Text) : async Bool {
        // For now, return true for all authenticated users / 目前，对所有已认证用户返回true
        // In future, implement role-based access control / 未来实现基于角色的访问控制
        switch (users.get(principalId)) {
            case (?user) { user.isVerified };
            case null { false };
        }
    };
    
    // ========== Operation Logging Methods / 操作日志记录方法 ==========
    
    // Log user operation / 记录用户操作
    public shared({caller}) func logOperation(userId: Text, principalId: Text, action: Text, metadata: Text) : async Text {
        let operationId = generateOperationId();
        let now = Time.now();
        
        let operation: OperationLog = {
            id = operationId;
            userId = userId;
            principalId = principalId;
            action = action;
            timestamp = now;
            metadata = metadata;
            txHash = generateTxHash(caller);
            status = "success";
            blockHeight = now; // Simplified block height / 简化的区块高度
        };
        
        operations.put(operationId, operation);
        operationId
    };
    
    // Get user operation history / 获取用户操作历史
    public query func getUserOperationHistory(principalId: Text, limit: Nat32) : async [OperationLog] {
        let userOperations = Iter.toArray(operations.vals());
        let filteredOperations = Array.filter<OperationLog>(userOperations, func (op) {
            Text.equal(op.principalId, principalId)
        });
        
        // Sort by timestamp (newest first) and limit results / 按时间戳排序（最新的在前）并限制结果
        let sortedOperations = Array.sort<OperationLog>(filteredOperations, func (a, b) {
            Nat64.compare(b.timestamp, a.timestamp)
        });
        
        if (Array.size(sortedOperations) <= Nat32.toNat(limit)) {
            sortedOperations
        } else {
            Array.subArray<OperationLog>(sortedOperations, 0, Nat32.toNat(limit))
        }
    };
    
    // Get operation by ID / 根据ID获取操作
    public query func getOperationById(operationId: Text) : async ?OperationLog {
        operations.get(operationId)
    };
    
    // ========== Relationship Validation Methods / 关系验证方法 ==========
    
    // Record invitation relationship / 记录邀请关系
    public shared({caller}) func recordInvitationRelationship(inviterPrincipalId: Text, inviteePrincipalId: Text, inviteCode: Text, relationshipType: Text) : async Text {
        let relationshipId = generateRelationshipId();
        let now = Time.now();
        
        let relationship: InvitationRelationship = {
            id = relationshipId;
            inviterPrincipalId = inviterPrincipalId;
            inviteePrincipalId = inviteePrincipalId;
            inviteCode = inviteCode;
            invitationTime = now;
            relationshipType = relationshipType;
            isActive = true;
        };
        
        relationships.put(relationshipId, relationship);
        relationshipId
    };
    
    // Get user invitation relationships / 获取用户邀请关系
    public query func getUserInvitationRelationships(principalId: Text) : async [InvitationRelationship] {
        let allRelationships = Iter.toArray(relationships.vals());
        Array.filter<InvitationRelationship>(allRelationships, func (rel) {
            Text.equal(rel.inviterPrincipalId, principalId) or Text.equal(rel.inviteePrincipalId, principalId)
        })
    };
    
    // Verify invitation relationship / 验证邀请关系
    public query func verifyInvitationRelationship(inviterPrincipalId: Text, inviteePrincipalId: Text) : async Bool {
        let allRelationships = Iter.toArray(relationships.vals());
        let matchingRelationships = Array.filter<InvitationRelationship>(allRelationships, func (rel) {
            Text.equal(rel.inviterPrincipalId, inviterPrincipalId) and Text.equal(rel.inviteePrincipalId, inviteePrincipalId) and rel.isActive
        });
        
        Array.size(matchingRelationships) > 0
    };
    
    // ========== Achievement/Badge Methods / 成就/徽章方法 ==========
    
    // Verify user achievement / 验证用户成就
    public shared({caller}) func verifyAchievement(userId: Text, principalId: Text, achievementType: Text, achievementId: Text, metadata: Text) : async Text {
        let verificationId = generateAchievementId();
        let now = Time.now();
        
        let achievement: AchievementVerification = {
            id = verificationId;
            userId = userId;
            principalId = principalId;
            achievementType = achievementType;
            achievementId = achievementId;
            verificationTime = now;
            metadata = metadata;
            isVerified = true;
        };
        
        achievements.put(verificationId, achievement);
        verificationId
    };
    
    // Get user achievements / 获取用户成就
    public query func getUserAchievements(principalId: Text) : async [AchievementVerification] {
        let allAchievements = Iter.toArray(achievements.vals());
        Array.filter<AchievementVerification>(allAchievements, func (ach) {
            Text.equal(ach.principalId, principalId) and ach.isVerified
        })
    };
    
    // ========== Admin Methods / 管理员方法 ==========
    
    // Check if caller is admin / 检查调用者是否为管理员
    public shared({caller}) func isAdmin(caller: Principal) : async Bool {
        Principal.equal(caller, admin)
    };
    
    // Get canister statistics / 获取容器统计信息
    public query func getCanisterStats() : async CanisterStats {
        {
            totalUsers = Nat64.fromNat(users.size());
            totalOperations = Nat64.fromNat(operations.size());
            totalRelationships = Nat64.fromNat(relationships.size());
            totalAchievements = Nat64.fromNat(achievements.size());
            lastUpdate = Time.now();
        }
    };
    
    // ========== System Methods / 系统方法 ==========
    
    // Get canister version / 获取容器版本
    public query func getVersion() : async Text {
        "1.0.0"
    };
    
    // Health check / 健康检查
    public query func healthCheck() : async Bool {
        true
    };
};
