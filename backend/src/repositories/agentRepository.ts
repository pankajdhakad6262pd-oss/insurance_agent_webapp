import { Agent, AgentDocument } from '../models/Agent';
import { IAgent } from '../types';

export class AgentRepository {
  async create(data: Partial<IAgent>): Promise<AgentDocument> {
    const agent = new Agent(data);
    return agent.save();
  }

  async findByEmail(email: string, includePassword = false): Promise<AgentDocument | null> {
    const query = Agent.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async findById(id: string): Promise<AgentDocument | null> {
    return Agent.findById(id).exec();
  }

  async count(): Promise<number> {
    return Agent.countDocuments().exec();
  }
}

export const agentRepository = new AgentRepository();

