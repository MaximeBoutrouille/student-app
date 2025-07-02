import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import CreatePlanningScreen from './CreatePlanningScreen';
import { generateOptimalPlanning, generatePlanningExplanation } from '../../utils/planningAlgorithm';
import { usePlanning } from '../../context/PlanningContext';

// Composant temporaire en attendant CreatePlanningScreen
function TempCreatePlanning({ onBack, onPlanningGenerated }: any) {
  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Mathématiques', examDate: '2025-01-20', coefficient: 2, type: 'revision', estimatedHours: 10, currentProgress: 0 },
    { id: '2', name: 'Histoire', examDate: '2025-01-25', coefficient: 1, type: 'revision', estimatedHours: 8, currentProgress: 0 }
  ]);
  
  const [timeSlots] = useState([
    { id: '1', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', available: true },
    { id: '2', dayOfWeek: 2, startTime: '08:00', endTime: '10:00', available: true },
    { id: '3', dayOfWeek: 3, startTime: '18:00', endTime: '20:00', available: true }
  ]);

  const handleGenerate = () => {
    const request = {
      subjects,
      availableSlots: timeSlots,
      preferences: {
        preferredStudyTime: 'flexible',
        maxSessionDuration: 120,
        breakBetweenSessions: 15,
        weekendStudy: false
      }
    };
    onPlanningGenerated(request);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Planning IA (Demo)</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.demoText}>
          📚 Matières configurées :
          {subjects.map(s => `\n• ${s.name} (examen ${s.examDate})`).join('')}
          
          {'\n\n'}⏰ Créneaux disponibles :
          {timeSlots.map(slot => {
            const days = ['', 'Lundi', 'Mardi', 'Mercredi'];
            return `\n• ${days[slot.dayOfWeek]} ${slot.startTime}-${slot.endTime}`;
          }).join('')}
        </Text>
        
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>🤖 Générer avec l'algorithme</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PlanningScreen() {
  const [showCreatePlanning, setShowCreatePlanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 🚀 UTILISER LE CONTEXTE PARTAGÉ
  const { generatedPlanning, setGeneratedPlanning, isGenerating: contextIsGenerating } = usePlanning();

  const handlePlanningGenerated = async (request: any) => { // Type explicite
    setIsGenerating(true);
    
    try {
      // 🤖 Ici c'est la VRAIE magie ! L'algorithme tourne
      console.log('🚀 Génération du planning avec l\'algorithme...');
      
      // Appel de l'algorithme intelligent
      const generatedSessions = generateOptimalPlanning(request);
      console.log('✅ Sessions générées:', generatedSessions);
      
      // Génération de l'explication naturelle
      const explanation = generatePlanningExplanation(generatedSessions, request.subjects);
      
      // Simuler un planning généré pour l'affichage
      const planning = {
        id: Date.now().toString(),
        name: 'Planning IA du ' + new Date().toLocaleDateString('fr-FR'),
        createdAt: new Date().toISOString(),
        sessions: generatedSessions,
        totalHours: generatedSessions.reduce((sum: any, session: any) => sum + session.duration, 0) / 60,
        subjects: request.subjects
      };
      
      setGeneratedPlanning(planning);
      setShowCreatePlanning(false);
      
      // Afficher la VRAIE réponse de l'algorithme
      Alert.alert(
        '🎉 Planning IA généré !',
        explanation.slice(0, 300) + '...\n\n🤖 Généré par algorithme intelligent !',
        [
          { text: 'Voir détail', onPress: () => console.log('Planning complet:', explanation) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('❌ Erreur génération:', error);
      Alert.alert('Erreur', 'Impossible de générer le planning');
    } finally {
      setIsGenerating(false);
    }
  };

  // Si on affiche l'écran de création
  if (showCreatePlanning) {
    return (
      <TempCreatePlanning
        onPlanningGenerated={handlePlanningGenerated}
        onBack={() => setShowCreatePlanning(false)}
      />
    );
  }

  const mockSessions = [
    {
      id: 1,
      subject: 'Mathématiques',
      time: '14:00 - 15:30',
      type: 'Révision',
      color: '#3B82F6',
    },
    {
      id: 2,
      subject: 'Histoire',
      time: '16:00 - 17:00',
      type: 'Exercices',
      color: '#10B981',
    },
    {
      id: 3,
      subject: 'Physique',
      time: '19:00 - 20:30',
      type: 'Cours',
      color: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning du jour</Text>
        <TouchableOpacity onPress={() => setShowCreatePlanning(true)}>
          <Ionicons name="sparkles" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 🤖 NOUVELLE CARTE PLANNING IA */}
        <TouchableOpacity 
          style={styles.aiPlanningCard}
          onPress={() => setShowCreatePlanning(true)}
          disabled={isGenerating}
        >
          <View style={styles.aiPlanningContent}>
            <Ionicons name="sparkles" size={32} color="#10B981" />
            <View style={styles.aiPlanningText}>
              <Text style={styles.aiPlanningTitle}>
                {isGenerating ? 'Génération en cours...' : '🤖 Planning IA'}
              </Text>
              <Text style={styles.aiPlanningSubtitle}>
                Laissez l'IA créer votre planning personnalisé optimal
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Affichage du planning généré par le CHAT ! */}
        {generatedPlanning && (
          <View style={styles.generatedPlanningCard}>
            <Text style={styles.generatedPlanningTitle}>
              ✨ {generatedPlanning.name}
            </Text>
            <Text style={styles.generatedPlanningInfo}>
              {generatedPlanning.subjects.length} matières • {generatedPlanning.totalHours.toFixed(1)}h total
            </Text>
            <Text style={styles.generatedPlanningSubtitle}>
              🤖 {generatedPlanning.sessions.length} sessions optimisées par algorithme
            </Text>
            
            {/* AFFICHAGE DES VRAIES SESSIONS GÉNÉRÉES */}
            <View style={styles.generatedSessionsContainer}>
              <Text style={styles.generatedSessionsTitle}>📅 Sessions planifiées :</Text>
              {generatedPlanning.sessions.slice(0, 3).map((session: any, index: number) => (
                <View key={session.id} style={styles.generatedSessionItem}>
                  <View style={[
                    styles.sessionIndicator, 
                    { backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'][index % 3] }
                  ]} />
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionSubject}>{session.subjectName}</Text>
                    <Text style={styles.sessionType}>{session.description}</Text>
                    <Text style={styles.sessionTime}>
                      {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short' })} {session.startTime}-{session.endTime}
                    </Text>
                  </View>
                </View>
              ))}
              {generatedPlanning.sessions.length > 3 && (
                <Text style={styles.moreSessionsText}>
                  ... et {generatedPlanning.sessions.length - 3} autres sessions
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.dateSection}>
          <Text style={styles.dateText}>Aujourd'hui</Text>
          <Text style={styles.dateSubtext}>3 sessions planifiées</Text>
        </View>

        <View style={styles.sessionsContainer}>
          {mockSessions.map((session) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={[styles.sessionIndicator, { backgroundColor: session.color }]} />
              <View style={styles.sessionContent}>
                <Text style={styles.sessionSubject}>{session.subject}</Text>
                <Text style={styles.sessionType}>{session.type}</Text>
                <Text style={styles.sessionTime}>{session.time}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.quickStartCard}>
          <View style={styles.quickStartContent}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.quickStartTitle}>Session Express 5min</Text>
            <Text style={styles.quickStartText}>
              Pas le temps ? Lancez une micro-session pour vous motiver !
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  demoText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 20,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  aiPlanningCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPlanningContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPlanningText: {
    marginLeft: 12,
    flex: 1,
  },
  aiPlanningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  aiPlanningSubtitle: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  generatedPlanningCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  generatedPlanningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3730A3',
    marginBottom: 4,
  },
  generatedPlanningInfo: {
    fontSize: 14,
    color: '#5B21B6',
    marginBottom: 4,
  },
  generatedPlanningSubtitle: {
    fontSize: 12,
    color: '#7C3AED',
    fontStyle: 'italic',
  },
  generatedSessionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
  },
  generatedSessionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3730A3',
    marginBottom: 12,
  },
  generatedSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moreSessionsText: {
    fontSize: 12,
    color: '#6366F1',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateSection: {
    paddingVertical: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  sessionsContainer: {
    marginBottom: 24,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  sessionContent: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  sessionType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  quickStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  quickStartContent: {
    flex: 1,
    marginLeft: 12,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  quickStartText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
});