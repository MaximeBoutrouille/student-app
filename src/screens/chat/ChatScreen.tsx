import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Message } from '../../types/chat';
import { sendMessageToAI } from '../../config/openai';
import MessageBubble from '../../components/chat/MessageBubble';
import QuickActions from '../../components/chat/QuickActions';
import { usePlanning } from '../../context/PlanningContext';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Salut ! 👋 Je suis ton assistant personnel pour t\'aider dans tes études. Comment ça va aujourd\'hui ?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // 🚀 AJOUT DU CONTEXTE PLANNING
  const { setGeneratedPlanning, setIsGenerating } = usePlanning();

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: { [key: string]: string } = {
      procrastination: 'J\'ai du mal à me motiver, je procrastine beaucoup...',
      planning: 'Peux-tu m\'aider à organiser mes révisions ?',
      quick_session: 'Je veux faire une session express de 5 minutes',
      motivation: 'J\'ai besoin de motivation pour étudier',
      organization: 'Comment mieux m\'organiser dans mes études ?'
    };
    
    const message = actionMessages[action] || action;
    sendMessage(message);
  };

  const sendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Message "en train de taper"
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);
    scrollToBottom();

    try {
      // Préparer l'historique pour l'IA
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await sendMessageToAI(text, conversationHistory);
      
      // Supprimer le message "typing"
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);

        // 🚀 NOUVELLE LOGIQUE : Si planning prêt, déclencher la génération !
        if (response.planningStep === 'ready' && response.planningData) {
          console.log('🎯 Planning prêt ! Déclenchement algorithme...');
          
          // Indiquer qu'on génère
          setIsGenerating(true);
          
          // Attendre un peu pour l'effet "génération"
          setTimeout(async () => {
            try {
              // Importer l'algorithme
              const { generateOptimalPlanning, generatePlanningExplanation } = 
                await import('../../utils/planningAlgorithm');
              
              // Créer la requête pour l'algorithme
              const planningRequest = {
                subjects: response.planningData.subjects,
                availableSlots: response.planningData.availableSlots,
                preferences: {
                  preferredStudyTime: 'flexible',
                  maxSessionDuration: 120,
                  breakBetweenSessions: 15,
                  weekendStudy: false
                }
              };
              
              // 🤖 EXÉCUTER L'ALGORITHME !
              const generatedSessions = generateOptimalPlanning(planningRequest);
              const explanation = generatePlanningExplanation(generatedSessions, response.planningData.subjects);
              
              console.log('✅ Algorithme exécuté !', generatedSessions);
              
              // 🚀 SAUVER DANS LE CONTEXTE PARTAGÉ !
              const planningData = {
                id: Date.now().toString(),
                name: 'Planning IA du ' + new Date().toLocaleDateString('fr-FR'),
                createdAt: new Date().toISOString(),
                sessions: generatedSessions,
                totalHours: generatedSessions.reduce((sum: any, session: any) => sum + session.duration, 0) / 60,
                subjects: response.planningData.subjects,
                explanation
              };
              
              setGeneratedPlanning(planningData);
              setIsGenerating(false);
              
              // Afficher le résultat dans le chat
              const resultMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: `🎉 **Planning généré avec succès !**

✨ **${generatedSessions.length} sessions** optimisées créées
📚 **${response.planningData.subjects.length} matières** réparties intelligemment
⏰ **${(generatedSessions.reduce((sum: any, s: any) => sum + s.duration, 0) / 60).toFixed(1)}h** de travail planifiées

📱 **Ton planning est maintenant visible dans l'onglet Planning !**

🎯 L'algorithme a priorisé tes examens les plus proches et optimisé la répartition !`,
                isUser: false,
                timestamp: new Date(),
              };
              
              setMessages(prev => [...prev, resultMessage]);
              
              // 🚀 BONUS : Alerte pour aller voir le planning
              Alert.alert(
                '🎉 Planning IA créé !',
                'Ton planning personnalisé est prêt ! Va dans l\'onglet Planning pour le voir.',
                [
                  { text: 'Plus tard' },
                  { text: 'Voir maintenant', onPress: () => {
                    // TODO: Navigation vers l'onglet Planning
                    console.log('Navigation vers Planning');
                  }}
                ]
              );
              
            } catch (error) {
              console.error('❌ Erreur algorithme:', error);
              setIsGenerating(false);
              const errorMessage: Message = {
                id: (Date.now() + 3).toString(),
                text: '❌ Oups ! Une erreur est survenue lors de la génération. Peux-tu réessayer ?',
                isUser: false,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, errorMessage]);
            }
          }, 2000); // 2 secondes pour l'effet "génération"
        }
        
      } else {
        Alert.alert('Erreur', response.error || 'Impossible de contacter l\'assistant');
        setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      }
    } catch (error) {
      console.error('Erreur chat:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.title}>Assistant IA</Text>
            <Text style={styles.subtitle}>Ton coach personnel</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        <QuickActions onActionPress={handleQuickAction} />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Tapez votre message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() && !isLoading ? '#FFFFFF' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});