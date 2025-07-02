import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ChatScreen from './src/screens/chat/ChatScreen';
import PlanningScreen from './src/screens/planning/PlanningScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = 'home';

              if (route.name === 'Chat') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === 'Planning') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              }

              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#9CA3AF',
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ tabBarLabel: 'Assistant IA' }}
          />
          <Tab.Screen 
            name="Planning" 
            component={PlanningScreen}
            options={{ tabBarLabel: 'Planning' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}