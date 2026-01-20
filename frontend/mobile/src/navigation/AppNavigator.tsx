/**
 * App Navigator
 * 
 * Main navigation structure for the app
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PanicScreen from '../screens/PanicScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CommunityReportsScreen from '../screens/CommunityReportsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,

          tabBarIconStyle: {
            display: 'none',
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarStyle: {
            backgroundColor: colors.backgroundSecondary,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 2,
            paddingTop: 10,
            height: 60,
            justifyContent: 'center',
            
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '600',
            marginBottom: 0,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          
        />
        <Tab.Screen
          name="Panic"
          component={PanicScreen}
          
        />
        <Tab.Screen
          name="Contacts"
          component={ContactsScreen}
          
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          
        />
        <Tab.Screen
          name="Community"
          component={CommunityReportsScreen}
          
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}



