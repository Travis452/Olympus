import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  initializeNotifications,
  cancelAllNotifications,
} from '../utils/notificationService';
import useAuth from '../hooks/useAuth';
import BackButton from '../components/BackButton';

const RED = '#ff1a1a';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);
  const [inactivityWarningsEnabled, setInactivityWarningsEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState(18); // 6 PM default
  const [reminderMinute, setReminderMinute] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const dailyEnabled = await AsyncStorage.getItem('dailyRemindersEnabled');
      const warningsEnabled = await AsyncStorage.getItem('inactivityWarningsEnabled');
      const hour = await AsyncStorage.getItem('reminderHour');
      const minute = await AsyncStorage.getItem('reminderMinute');

      if (dailyEnabled !== null) setDailyRemindersEnabled(dailyEnabled === 'true');
      if (warningsEnabled !== null) setInactivityWarningsEnabled(warningsEnabled === 'true');
      if (hour !== null) setReminderHour(parseInt(hour));
      if (minute !== null) setReminderMinute(parseInt(minute));
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleDailyReminders = async (value) => {
    setDailyRemindersEnabled(value);
    await AsyncStorage.setItem('dailyRemindersEnabled', value.toString());

    if (value) {
      await scheduleDailyReminder(reminderHour, reminderMinute);
    } else {
      await cancelDailyReminder();
    }
  };

  const toggleInactivityWarnings = async (value) => {
    setInactivityWarningsEnabled(value);
    await AsyncStorage.setItem('inactivityWarningsEnabled', value.toString());
  };

  const updateReminderTime = async (hour, minute) => {
    setReminderHour(hour);
    setReminderMinute(minute);
    
    await AsyncStorage.setItem('reminderHour', hour.toString());
    await AsyncStorage.setItem('reminderMinute', minute.toString());

    if (dailyRemindersEnabled) {
      await scheduleDailyReminder(hour, minute);
    }
  };

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <LinearGradient colors={['#000', '#1a1a1a', '#000']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>NOTIFICATIONS</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Daily Reminders */}
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Daily Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get motivated to log your workouts
                </Text>
              </View>
              <Switch
                value={dailyRemindersEnabled}
                onValueChange={toggleDailyReminders}
                trackColor={{ false: '#555', true: RED }}
                thumbColor={dailyRemindersEnabled ? '#fff' : '#ccc'}
              />
            </View>

            {dailyRemindersEnabled && (
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>Reminder Time</Text>
                <Text style={styles.currentTime}>{formatTime(reminderHour, reminderMinute)}</Text>
                
                <View style={styles.pickerRow}>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Hour</Text>
                    <Picker
                      selectedValue={reminderHour}
                      onValueChange={(value) => updateReminderTime(value, reminderMinute)}
                      style={styles.picker}
                      dropdownIconColor={RED}
                    >
                      {hours.map(h => (
                        <Picker.Item
                          key={h}
                          label={`${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`}
                          value={h}
                          color="#fff"
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Minute</Text>
                    <Picker
                      selectedValue={reminderMinute}
                      onValueChange={(value) => updateReminderTime(reminderHour, value)}
                      style={styles.picker}
                      dropdownIconColor={RED}
                    >
                      {minutes.map(m => (
                        <Picker.Item
                          key={m}
                          label={m.toString().padStart(2, '0')}
                          value={m}
                          color="#fff"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Inactivity Warnings */}
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Inactivity Warnings</Text>
                <Text style={styles.settingDescription}>
                  Get reminded after 3+ days without a workout
                </Text>
              </View>
              <Switch
                value={inactivityWarningsEnabled}
                onValueChange={toggleInactivityWarnings}
                trackColor={{ false: '#555', true: RED }}
                thumbColor={inactivityWarningsEnabled ? '#fff' : '#ccc'}
              />
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <Text style={styles.infoText}>
              • Daily reminders keep you on track{'\n'}
              • Day 3: Gentle reminder{'\n'}
              • Day 4+: Start losing 10 EXP every 4 days{'\n'}
              • Your streak breaks after 48 hours
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Orbitron_800ExtraBold',
    color: RED,
    textAlign: 'center',
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 3,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255,26,26,0.05)',
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  timePicker: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  currentTime: {
    color: RED,
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#000',
    borderRadius: 8,
    color: '#fff',
  },
  infoCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    color: RED,
    fontSize: 16,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 22,
  },
});

export default NotificationSettings;
