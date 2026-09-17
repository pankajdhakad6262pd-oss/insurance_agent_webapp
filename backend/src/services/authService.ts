import jwt from 'jsonwebtoken';
import { agentRepository, AgentRepository } from '../repositories/agentRepository';
import { config } from '../config/env';
import { AppError } from '../middleware/errorMiddleware';
import { AuthTokenPayload, IAgent, UserRole } from '../types';

export class AuthService {
  constructor(private agentRepo: AgentRepository = agentRepository) {}

  generateToken(agent: { _id: any; email: string; name: string; role: UserRole }): string {
    const payload: AuthTokenPayload = {
      id: agent._id.toString(),
      email: agent.email,
      name: agent.name,
      role: agent.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async register(data: { name: string; email: string; mobile: string; password: string }): Promise<{ agent: IAgent; token: string }> {
    const existing = await this.agentRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const agent = await this.agentRepo.create({
      name: data.name,
      email: data.email.toLowerCase(),
      mobile: data.mobile,
      password: data.password,
      role: 'agent',
    });

    const token = this.generateToken(agent);
    return {
      agent: agent.toJSON() as unknown as IAgent,
      token,
    };
  }

  async login(data: { email: string; password: string }): Promise<{ agent: IAgent; token: string }> {
    const agent = await this.agentRepo.findByEmail(data.email, true);
    if (!agent) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await agent.comparePassword(data.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(agent);
    return {
      agent: agent.toJSON() as unknown as IAgent,
      token,
    };
  }

  async getProfile(agentId: string): Promise<IAgent> {
    const agent = await this.agentRepo.findById(agentId);
    if (!agent) {
      throw new AppError('Agent profile not found', 404);
    }
    return agent.toJSON() as unknown as IAgent;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const agent = await this.agentRepo.findByEmail(email);
    if (!agent) {
      // Return ambiguous message for security
      return { message: 'If an account exists with this email, password reset instructions have been sent.' };
    }
    // Mock implementation as requested in prompt
    console.log(`[AuthService] Password reset requested for: ${email}. Mock token generated.`);
    return {
      message: 'Password reset link sent to your registered email address (mock).',
    };
  }
}

export const authService = new AuthService();

