/**
 * Type definitions for React Navigation
 */

export type RootStackParamList = {
  /**
   * Login screen - no parameters
   */
  Login: undefined;
  
  /**
   * Home screen - no parameters
   */
  Home: undefined;
  
  /**
   * Comments screen - requires todo ID and title
   */
  Comments: { 
    todo_id: string;  // ID of the todo item
    title: string;    // Title of the todo item for display
  };
};
