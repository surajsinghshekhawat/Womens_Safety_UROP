/**
 * App Navigator — SafeNaari
 * Bottom tab navigation with Ionicons
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { TabBarIcon } from '../components/AppIcons';

import HomeScreen from '../screens/HomeScreen';
import PanicScreen from '../screens/PanicScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CommunityReportsScreen from '../screens/CommunityReportsScreen';
import RoutePlanningScreen from '../screens/RoutePlanningScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.backgroundSecondary,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 10,
            height: 64,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIconStyle: { marginBottom: 0 },
          tabBarItemStyle: { paddingTop: 4 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Panic"
          component={PanicScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabBarIcon name="alert-circle" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            tabBarLabel: 'Report',
            tabBarIcon: ({ focused }) => <TabBarIcon name="document-text" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityReportsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabBarIcon name="people" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Routes"
          component={RoutePlanningScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabBarIcon name="map" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
