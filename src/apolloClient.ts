// Import ApolloClient and InMemoryCache from Apollo Client to set up the GraphQL client
import { ApolloClient, InMemoryCache } from '@apollo/client';

// Create a new instance of ApolloClient
const client = new ApolloClient({
  // URI of the GraphQL server for backend communication
  uri: 'https://backend-telbot.onrender.com',
  // uri:'http://localhost:4000',
  
  // Configure cache using InMemoryCache to store query results for performance
  cache: new InMemoryCache(),
});

// Export the Apollo client instance to be used in other parts of the app
export default client;
