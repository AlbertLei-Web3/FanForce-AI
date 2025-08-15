// FanForce AI - ICP Integration Service / FanForce AI - ICP集成服务
// Service for communicating with ICP canister for season bonus management / 用于与ICP容器通信进行赛季奖金管理的服务
// This service provides a bridge between the frontend and ICP network / 此服务提供前端和ICP网络之间的桥梁

// ICP Canister Interface Types / ICP容器接口类型
export interface AthleteProfile {
  id: string;
  name: string;
  studentId: string;
  sport: string;
  position: string;
  team: string;
  rank: string;
  rankPoints: number;
  status: string;
}

export interface SeasonBonus {
  athleteId: string;
  seasonId: string;
  baseSalary: number;
  performanceBonus: number;
  matchBonus: number;
  socialBonus: number;
  totalBonus: number;
  claimed: boolean;
  claimTime?: number;
  seasonMatches: number;
  socialPosts: number;
}

export interface Season {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  totalPool: number;
  distributedPool: number;
}

export interface CanisterStats {
  totalAthletes: number;
  totalBonuses: number;
  totalSeasons: number;
  totalDistributed: number;
}

// 新增：用户身份验证接口 / New: User Identity Verification Interface
export interface UserIdentity {
  principalId: string;
  walletAddress?: string;
  role: string;
  inviteCode: string;
  invitedBy?: string;
  createdAt: number;
  lastActive: number;
  isVerified: boolean;
}

// 新增：邀请码验证接口 / New: Invite Code Verification Interface
export interface InviteCodeVerification {
  code: string;
  isValid: boolean;
  inviterPrincipalId?: string;
  inviterRole?: string;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: number;
}

// 新增：操作日志接口 / New: Operation Log Interface
export interface OperationLog {
  userId: string;
  principalId: string;
  action: string;
  timestamp: number;
  metadata?: any;
  txHash?: string;
  status: 'pending' | 'success' | 'failed';
}

// Mock ICP Canister ID for demo purposes / 用于演示的模拟ICP容器ID
const MOCK_CANISTER_ID = "bkyz2-fmaaa-aaaaa-aaaqa-cai"; // Mock canister ID / 模拟容器ID

// ICP Service Class / ICP服务类
class ICPService {
  private canisterId: string;
  private isConnected: boolean = false;

  constructor(canisterId: string = MOCK_CANISTER_ID) {
    this.canisterId = canisterId;
  }

  // Initialize connection to ICP / 初始化ICP连接
  async initialize(): Promise<boolean> {
    try {
      // In a real implementation, this would connect to the actual ICP network
      // 在真实实现中，这将连接到实际的ICP网络
      console.log("Connecting to ICP canister:", this.canisterId);
      
      // Simulate connection delay / 模拟连接延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      console.log("Successfully connected to ICP canister");
      return true;
    } catch (error) {
      console.error("Failed to connect to ICP canister:", error);
      return false;
    }
  }

  // ========== 新增：用户身份验证方法 / New: User Identity Verification Methods ==========
  
  // 验证用户ICP身份 / Verify user ICP identity
  async verifyUserIdentity(principalId: string): Promise<UserIdentity | null> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      console.log("🔐 验证用户ICP身份:", principalId);
      
      // 模拟ICP身份验证 / Simulate ICP identity verification
      const mockIdentity: UserIdentity = {
        principalId: principalId,
        walletAddress: `icp_wallet_${principalId.slice(0, 8)}`,
        role: "audience", // 默认角色，实际应从数据库获取 / Default role, should get from database
        inviteCode: `FF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        createdAt: Date.now(),
        lastActive: Date.now(),
        isVerified: true
      };

      // 模拟验证延迟 / Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log("✅ ICP身份验证成功:", mockIdentity);
      return mockIdentity;
    } catch (error) {
      console.error("❌ ICP身份验证失败:", error);
      return null;
    }
  }

  // 验证邀请码 / Verify invite code
  async verifyInviteCode(code: string): Promise<InviteCodeVerification | null> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      console.log("🔍 验证邀请码:", code);
      
      // 模拟邀请码验证 / Simulate invite code verification
      const mockVerification: InviteCodeVerification = {
        code: code,
        isValid: code.startsWith("FF-") && code.length === 9,
        inviterPrincipalId: "75ps5-fwgjd-mdwrb-qq6ab-sagkb-li6ap-dplnp-nwggq-3lktb-ytwpj-7ae",
        inviterRole: "ambassador",
        usageCount: 0,
        maxUsage: 100,
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1年后过期 / Expires in 1 year
      };

      // 模拟验证延迟 / Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log("✅ 邀请码验证完成:", mockVerification);
      return mockVerification;
    } catch (error) {
      console.error("❌ 邀请码验证失败:", error);
      return null;
    }
  }

  // 记录操作日志到链上 / Log operation to blockchain
  async logOperation(
    userId: string, 
    principalId: string, 
    action: string, 
    metadata?: any
  ): Promise<OperationLog | null> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      console.log("📝 记录操作到链上:", { userId, principalId, action });
      
      // 模拟链上日志记录 / Simulate blockchain logging
      const mockLog: OperationLog = {
        userId: userId,
        principalId: principalId,
        action: action,
        timestamp: Date.now(),
        metadata: metadata,
        txHash: `icp_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'success'
      };

      // 模拟链上操作延迟 / Simulate blockchain operation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("✅ 操作日志记录成功:", mockLog);
      return mockLog;
    } catch (error) {
      console.error("❌ 操作日志记录失败:", error);
      return null;
    }
  }

  // 获取用户操作历史 / Get user operation history
  async getUserOperationHistory(principalId: string): Promise<OperationLog[]> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      console.log("📚 获取用户操作历史:", principalId);
      
      // 模拟操作历史数据 / Simulate operation history data
      const mockHistory: OperationLog[] = [
        {
          userId: "user_123",
          principalId: principalId,
          action: "user_registration",
          timestamp: Date.now() - 86400000, // 1天前 / 1 day ago
          metadata: { role: "audience", inviteCode: "FF-ABC123" },
          txHash: "icp_tx_1234567890_abc123",
          status: 'success'
        },
        {
          userId: "user_123",
          principalId: principalId,
          action: "profile_update",
          timestamp: Date.now() - 3600000, // 1小时前 / 1 hour ago
          metadata: { updatedFields: ["username", "profile_data"] },
          txHash: "icp_tx_1234567890_def456",
          status: 'success'
        }
      ];

      // 模拟查询延迟 / Simulate query delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log("✅ 获取操作历史成功:", mockHistory);
      return mockHistory;
    } catch (error) {
      console.error("❌ 获取操作历史失败:", error);
      return [];
    }
  }

  // ========== 现有方法保持不变 / Existing methods remain unchanged ==========

  // Get athlete profile from ICP / 从ICP获取运动员档案
  async getAthleteProfile(athleteId: string): Promise<AthleteProfile | null> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Mock data for demo / 演示用模拟数据
      const mockProfile: AthleteProfile = {
        id: athleteId,
        name: "Mike \"The Machine\" Johnson",
        studentId: "2023001",
        sport: "Basketball",
        position: "Point Guard",
        team: "Campus Warriors",
        rank: "Gold",
        rankPoints: 1250,
        status: "active"
      };

      // Simulate ICP query delay / 模拟ICP查询延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockProfile;
    } catch (error) {
      console.error("Error fetching athlete profile from ICP:", error);
      return null;
    }
  }

  // Get season bonus from ICP / 从ICP获取赛季奖金
  async getSeasonBonus(athleteId: string, seasonId: string): Promise<SeasonBonus | null> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Mock data for demo / 演示用模拟数据
      const mockBonus: SeasonBonus = {
        athleteId: athleteId,
        seasonId: seasonId,
        baseSalary: 120.75,
        performanceBonus: 85.0,
        matchBonus: 80.0, // 8 matches * 10 ICP / 8场比赛 * 10 ICP
        socialBonus: 25.0, // 5 posts * 5 ICP / 5个帖子 * 5 ICP
        totalBonus: 205.75,
        claimed: false,
        seasonMatches: 8,
        socialPosts: 5
      };

      // Simulate ICP query delay / 模拟ICP查询延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockBonus;
    } catch (error) {
      console.error("Error fetching season bonus from ICP:", error);
      return null;
    }
  }

  // Get all season bonuses for an athlete / 获取运动员的所有赛季奖金
  async getAthleteBonuses(athleteId: string): Promise<SeasonBonus[]> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Mock data for demo / 演示用模拟数据
      const mockBonuses: SeasonBonus[] = [
        {
          athleteId: athleteId,
          seasonId: "season_2024_spring",
          baseSalary: 120.75,
          performanceBonus: 85.0,
          matchBonus: 80.0,
          socialBonus: 25.0,
          totalBonus: 205.75,
          claimed: true,
          claimTime: Date.now() - 86400000, // 1 day ago / 1天前
          seasonMatches: 8,
          socialPosts: 5
        },
        {
          athleteId: athleteId,
          seasonId: "season_2024_fall",
          baseSalary: 135.50,
          performanceBonus: 95.0,
          matchBonus: 90.0,
          socialBonus: 30.0,
          totalBonus: 230.50,
          claimed: false,
          seasonMatches: 9,
          socialPosts: 6
        }
      ];

      // Simulate ICP query delay / 模拟ICP查询延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockBonuses;
    } catch (error) {
      console.error("Error fetching athlete bonuses from ICP:", error);
      return [];
    }
  }

  // Claim season bonus on ICP / 在ICP上领取赛季奖金
  async claimSeasonBonus(athleteId: string, seasonId: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Simulate ICP transaction / 模拟ICP交易
      console.log(`Claiming season bonus for athlete ${athleteId} in season ${seasonId}`);
      
      // Simulate transaction delay / 模拟交易延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock transaction ID / 生成模拟交易ID
      const transactionId = `icp_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("ICP Transaction ID:", transactionId);

      return true;
    } catch (error) {
      console.error("Error claiming season bonus on ICP:", error);
      return false;
    }
  }

  // Get canister statistics / 获取容器统计信息
  async getCanisterStats(): Promise<CanisterStats> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Mock statistics / 模拟统计信息
      const mockStats: CanisterStats = {
        totalAthletes: 156,
        totalBonuses: 342,
        totalSeasons: 4,
        totalDistributed: 45678.90
      };

      // Simulate ICP query delay / 模拟ICP查询延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      return mockStats;
    } catch (error) {
      console.error("Error fetching canister stats from ICP:", error);
      return {
        totalAthletes: 0,
        totalBonuses: 0,
        totalSeasons: 0,
        totalDistributed: 0
      };
    }
  }

  // Get ICP network status / 获取ICP网络状态
  async getNetworkStatus(): Promise<{
    isConnected: boolean;
    canisterId: string;
    network: string;
    latency: number;
  }> {
    try {
      // Simulate network status check / 模拟网络状态检查
      const latency = Math.random() * 100 + 50; // 50-150ms / 50-150毫秒

      return {
        isConnected: this.isConnected,
        canisterId: this.canisterId,
        network: "Internet Computer",
        latency: Math.round(latency)
      };
    } catch (error) {
      console.error("Error checking ICP network status:", error);
      return {
        isConnected: false,
        canisterId: this.canisterId,
        network: "Internet Computer",
        latency: 0
      };
    }
  }

  // Generate ICP transaction URL / 生成ICP交易URL
  generateTransactionUrl(transactionId: string): string {
    return `https://dashboard.internetcomputer.org/transaction/${transactionId}`;
  }

  // Generate ICP canister URL / 生成ICP容器URL
  generateCanisterUrl(): string {
    return `https://dashboard.internetcomputer.org/canister/${this.canisterId}`;
  }
}

// Export singleton instance / 导出单例实例
export const icpService = new ICPService(); 