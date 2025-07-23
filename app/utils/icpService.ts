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