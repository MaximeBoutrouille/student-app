import OpenAI from 'openai';

// ⚠️ REMPLACEZ par votre vraie clé OpenAI
const OPENAI_API_KEY = 'xxx';

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// État global pour stocker les données de planning en cours
let planningSession = {
  isActive: false,
  step: 'idle', // 'collecting_subjects', 'collecting_schedule', 'ready'
  subjects: [],
  availableSlots: [],
  userData: {}
};

export function getPlanningSession() {
  return planningSession;
}

export function resetPlanningSession() {
  planningSession = {
    isActive: false,
    step: 'idle',
    subjects: [],
    availableSlots: [],
    userData: {}
  };
}

export async function sendMessageToAI(message, conversationHistory = []) {
  // Détecter si c'est une demande de planning
  const planningKeywords = ['planning', 'planifier', 'révision', 'examens', 'organiser', 'programme'];
  const isPlanningRequest = planningKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  if (isPlanningRequest && !planningSession.isActive) {
    // Démarrer une session de planning
    planningSession.isActive = true;
    planningSession.step = 'collecting_subjects';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `🎯 Parfait ! Je vais créer ton planning personnalisé !

📚 **Étape 1/3 : Tes matières**

Dis-moi quelles matières tu étudies et quand sont tes examens.

*Format : "Mathématiques examen 20 janvier, Histoire examen 25 janvier"*

Ou liste-les une par une ! 😊`,
      planningStep: 'collecting_subjects'
    };
  }
  
  // Si on est en train de collecter les matières
  if (planningSession.isActive && planningSession.step === 'collecting_subjects') {
    // Parser les matières depuis le message
    const subjects = parseSubjectsFromMessage(message);
    planningSession.subjects = subjects;
    planningSession.step = 'collecting_schedule';
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: `✅ Super ! J'ai noté ${subjects.length} matières :
${subjects.map(s => `• ${s.name} (examen ${s.examDate})`).join('\n')}

⏰ **Étape 2/3 : Tes créneaux libres**

Maintenant, dis-moi quand tu es disponible pour étudier.

*Exemple : "Lundi 14h-16h, Mardi 9h-11h, Mercredi 18h-20h"*`,
      planningStep: 'collecting_schedule'
    };
  }
  
  // Si on collecte les créneaux
  if (planningSession.isActive && planningSession.step === 'collecting_schedule') {
    const slots = parseScheduleFromMessage(message);
    planningSession.availableSlots = slots;
    planningSession.step = 'ready';
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: `🎉 Excellent ! J'ai tous les éléments :

📚 **${planningSession.subjects.length} matières** configurées
⏰ **${slots.length} créneaux** disponibles

🤖 **Génération de ton planning optimal en cours...**

*L'algorithme analyse tes priorités et optimise la répartition...*`,
      planningStep: 'ready',
      planningData: {
        subjects: planningSession.subjects,
        availableSlots: planningSession.availableSlots
      }
    };
  }
  
  // Mode démo - simule des réponses intelligentes pour autres messages
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const responses = {
    'procrastination': 'Je comprends ! 😊 La procrastination touche 95% des étudiants. Veux-tu qu\'on commence par une micro-session de 5 minutes ? C\'est plus facile que de se lancer dans 2h d\'études !',
    'quick_session': '⚡ Excellent choix ! 5 minutes c\'est le temps parfait pour se remettre en route. Choisis une matière et on démarre un mini-exercice !',
    'motivation': '💪 Tu sais quoi ? Le fait que tu demandes de l\'aide montre déjà ta motivation ! Quel est ton objectif principal cette semaine ?',
    'Test bouton': '🚀 Super ! Le chat fonctionne parfaitement ! Tu peux maintenant me poser tes vraies questions d\'étudiant.',
    'bonjour': '👋 Salut ! Je suis ton assistant personnel pour t\'aider dans tes études. Comment puis-je t\'accompagner aujourd\'hui ?',
    'aide': '🎯 Je peux t\'aider avec plein de choses ! Planifier tes révisions, te motiver, créer des sessions express... Dis-moi ce qui te préoccupe !',
  };
  
  // Trouve une réponse appropriée
  let response = '🤔 Intéressant ! Peux-tu me donner plus de détails ? Je suis là pour t\'aider avec tes études !';
  
  for (const [key, value] of Object.entries(responses)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      response = value;
      break;
    }
  }
  
  return {
    success: true,
    message: response + '\n\n💡 Tu peux me demander de planifier tes révisions quand tu veux !',
  };
}

// Fonctions utilitaires de parsing
function parseSubjectsFromMessage(message) {
  const subjects = [];
  
  // Patterns de détection simples
  const patterns = [
    /(\w+)\s+examen\s+(\d+\s+\w+)/gi,
    /(\w+)\s+le\s+(\d+\/\d+)/gi,
    /(\w+)\s+(\d{4}-\d{2}-\d{2})/gi
  ];
  
  // Si aucun pattern détecté, créer des matières par défaut
  if (!patterns.some(pattern => pattern.test(message))) {
    const commonSubjects = ['mathématiques', 'histoire', 'physique', 'français', 'anglais'];
    const words = message.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      if (commonSubjects.some(subject => word.includes(subject.slice(0, 4)))) {
        subjects.push({
          id: `subject_${subjects.length}`,
          name: word.charAt(0).toUpperCase() + word.slice(1),
          examDate: getDefaultExamDate(index),
          coefficient: 1,
          type: 'revision',
          estimatedHours: 8,
          currentProgress: 0
        });
      }
    });
  }
  
  // Si toujours rien, utiliser des exemples
  if (subjects.length === 0) {
    const subjectNames = message.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 2);
    subjectNames.forEach((name, index) => {
      subjects.push({
        id: `subject_${index}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        examDate: getDefaultExamDate(index),
        coefficient: 1,
        type: 'revision',
        estimatedHours: 8,
        currentProgress: 0
      });
    });
  }
  
  return subjects.length > 0 ? subjects : [{
    id: 'subject_1',
    name: 'Mathématiques',
    examDate: '2025-01-20',
    coefficient: 2,
    type: 'revision',
    estimatedHours: 10,
    currentProgress: 0
  }];
}

function parseScheduleFromMessage(message) {
  const slots = [];
  const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  
  // Pattern simple pour détecter les créneaux
  dayNames.forEach((day, index) => {
    if (message.toLowerCase().includes(day)) {
      // Chercher des heures après le jour
      const timePattern = /(\d{1,2})h?[-–](\d{1,2})h?/g;
      const matches = [...message.matchAll(timePattern)];
      
      matches.forEach((match, slotIndex) => {
        slots.push({
          id: `slot_${index}_${slotIndex}`,
          dayOfWeek: index + 1,
          startTime: `${match[1].padStart(2, '0')}:00`,
          endTime: `${match[2].padStart(2, '0')}:00`,
          available: true
        });
      });
    }
  });
  
  // Si aucun créneau détecté, utiliser des créneaux par défaut
  if (slots.length === 0) {
    return [
      { id: 'slot_1', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', available: true },
      { id: 'slot_2', dayOfWeek: 2, startTime: '09:00', endTime: '11:00', available: true },
      { id: 'slot_3', dayOfWeek: 3, startTime: '18:00', endTime: '20:00', available: true }
    ];
  }
  
  return slots;
}

function getDefaultExamDate(index) {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 14 + (index * 7)); // 2 semaines + index
  return baseDate.toISOString().split('T')[0];
}