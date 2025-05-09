
import { ProductionScenario, OrderSchedule } from "../types";

const API_BASE_URL = "https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod";

interface SimulateOrdersResponse {
  scenarios: ProductionScenario[];
  schedules: OrderSchedule[];
}

export const api = {
  async getProductionScenarios(dataSource: string): Promise<ProductionScenario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/GetProductionScenarios?DataSource=${dataSource}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching production scenarios:', error);
      throw error;
    }
  },
  
  async getOrders(scenarios: ProductionScenario[]): Promise<OrderSchedule[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/GetOrders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenarios),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calculating orders:', error);
      throw error;
    }
  },
  
  async simulateOrders(dataSource: string, algorithmType: string): Promise<SimulateOrdersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/SimulateOrders?DataSource=${dataSource}&AlgorithmType=${algorithmType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error simulating orders:', error);
      throw error;
    }
  }
};
