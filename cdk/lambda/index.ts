
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ProductionScenario, ProductionScenarioArray, OrderSchedule, OrderScheduleArray } from '../src/types';
import { calculateOrderSchedules } from '../src/utils/algorithmMain';
import { generateProductionScenarios } from '../src/utils/dataGenerator';

// Pre-generated production scenarios for "Customer" data source
const CUSTOMER_SCENARIOS: ProductionScenarioArray = generateProductionScenarios(20, 'customer');

// Pre-generated production scenarios for "Sim" data source
const SIM_SCENARIOS: ProductionScenarioArray = generateProductionScenarios(20, 'sim');

/**
 * Main handler for the Lambda function
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set CORS headers for all responses
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };
    
    // Extract the path from the event
    const path = event.path.split('/').pop();
    
    switch (path) {
      case 'GetProductionScenarios':
        return await handleGetProductionScenarios(event, headers);
        
      case 'GetOrders':
        return await handleGetOrders(event, headers);
        
      case 'SimulateOrders':
        return await handleSimulateOrders(event, headers);
        
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not Found' })
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

/**
 * Handler for the GetProductionScenarios API endpoint
 */
async function handleGetProductionScenarios(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const dataSource = event.queryStringParameters?.DataSource || 'Customer';
  
  let scenarios: ProductionScenarioArray;
  
  switch (dataSource) {
    case 'Random':
      // Generate random scenarios on demand
      scenarios = generateProductionScenarios(20, 'random');
      break;
      
    case 'Sim':
      // Return pre-generated scenarios for "Sim" data source
      scenarios = SIM_SCENARIOS;
      break;
      
    case 'Customer':
    default:
      // Return pre-generated scenarios for "Customer" data source
      scenarios = CUSTOMER_SCENARIOS;
      break;
  }
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(scenarios)
  };
}

/**
 * Handler for the GetOrders API endpoint
 */
async function handleGetOrders(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing request body' })
    };
  }
  
  try {
    // Parse the request body to get the scenarios
    const scenarios: ProductionScenarioArray = JSON.parse(event.body);
    
    // Get algorithm type from query parameters or default to 'Mock'
    const algorithmType = (event.queryStringParameters?.AlgorithmType || 'Mock') as 'Mock' | 'Algo1' | 'Algo2' | 'Algo3';
    
    // Calculate order schedules
    const schedules: OrderScheduleArray = calculateOrderSchedules(scenarios, algorithmType);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(schedules)
    };
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Bad Request',
        message: 'Invalid request body format'
      })
    };
  }
}

/**
 * Handler for the SimulateOrders API endpoint
 */
async function handleSimulateOrders(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  // Get parameters from query string
  const dataSource = event.queryStringParameters?.DataSource || 'Customer';
  const algorithmType = (event.queryStringParameters?.AlgorithmType || 'Mock') as 'Mock' | 'Algo1' | 'Algo2' | 'Algo3';
  
  // Get production scenarios based on the data source
  let scenarios: ProductionScenarioArray;
  
  switch (dataSource) {
    case 'Random':
      scenarios = generateProductionScenarios(20, 'random');
      break;
      
    case 'Sim':
      scenarios = SIM_SCENARIOS;
      break;
      
    case 'Customer':
    default:
      scenarios = CUSTOMER_SCENARIOS;
      break;
  }
  
  // Calculate order schedules
  const schedules: OrderScheduleArray = calculateOrderSchedules(scenarios, algorithmType);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      scenarios,
      schedules
    })
  };
}
