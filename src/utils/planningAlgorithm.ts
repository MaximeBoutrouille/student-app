// Version simplifiée sans erreurs TypeScript
export function generateOptimalPlanning(request: any): any[] {
  const { subjects, availableSlots } = request;
  const sessions: any[] = []; // Type explicite
  
  // 1. Calculer les priorités
  const prioritizedSubjects = subjects.map((subject: any) => {
    const examDate = new Date(subject.examDate);
    const now = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Score d'urgence (plus l'examen est proche, plus c'est urgent)
    const urgencyScore = Math.max(0.1, Math.min(1, (30 - daysUntilExam) / 30));
    
    return {
      ...subject,
      urgencyScore,
      priority: urgencyScore * 0.7 + (subject.coefficient || 1) * 0.3
    };
  }).sort((a: any, b: any) => b.priority - a.priority);

  // 2. Distribuer dans les créneaux
  availableSlots.forEach((slot: any, index: number) => {
    if (index < prioritizedSubjects.length) {
      const subject = prioritizedSubjects[index % prioritizedSubjects.length];
      
      const session = {
        id: `session_${index}`,
        subjectId: subject.id,
        subjectName: subject.name,
        date: getNextDate(slot.dayOfWeek),
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: calculateDuration(slot.startTime, slot.endTime),
        type: subject.type || 'revision',
        priority: subject.urgencyScore > 0.7 ? 'high' : subject.urgencyScore > 0.4 ? 'medium' : 'low',
        description: generateDescription(subject, slot)
      };
      
      sessions.push(session);
    }
  });
  
  return sessions;
}

function getNextDate(dayOfWeek: number): string {
  const today = new Date();
  const targetDay = new Date(today);
  const daysUntilTarget = (dayOfWeek - today.getDay() + 7) % 7;
  
  if (daysUntilTarget === 0 && today.getHours() >= 18) {
    targetDay.setDate(today.getDate() + 7);
  } else {
    targetDay.setDate(today.getDate() + daysUntilTarget);
  }
  
  return targetDay.toISOString().split('T')[0];
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end - start;
}

function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function generateDescription(subject: any, slot: any): string {
  const type = subject.type || 'revision';
  
  const descriptions: { [key: string]: string } = {
    'revision': `Révision intensive ${subject.name} - Focus sur les points clés`,
    'exercices': `Exercices pratiques ${subject.name} - Entraînement ciblé`,
    'redaction': `Rédaction ${subject.name} - Préparation écrite`,
    'retapage': `Retapage cours ${subject.name} - Consolidation`
  };
  
  return descriptions[type] || `Session ${subject.name}`;
}

// Fonction pour générer une explication naturelle du planning
export function generatePlanningExplanation(sessions: any[], subjects: any[]): string {
  const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0) / 60;
  const subjectCount = new Set(sessions.map(s => s.subjectId)).size;
  
  let explanation = `🎯 Planning optimisé généré ! Voici ce que j'ai prévu :\n\n`;
  
  // Grouper par jour
  const sessionsByDay: { [date: string]: any[] } = {};
  sessions.forEach(session => {
    if (!sessionsByDay[session.date]) {
      sessionsByDay[session.date] = [];
    }
    sessionsByDay[session.date].push(session);
  });
  
  // Générer le planning jour par jour
  Object.entries(sessionsByDay).forEach(([date, daySessions]) => {
    const dayName = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
    explanation += `📅 **${dayName.charAt(0).toUpperCase() + dayName.slice(1)}** :\n`;
    
    daySessions.forEach(session => {
      const urgency = session.priority === 'high' ? '🔥' : session.priority === 'medium' ? '⚠️' : '📚';
      explanation += `${urgency} ${session.startTime}-${session.endTime} : ${session.description}\n`;
    });
    explanation += '\n';
  });
  
  // Conseils personnalisés
  explanation += `💡 **Mes conseils** :\n`;
  explanation += `• ${totalHours.toFixed(1)}h de travail réparties sur ${subjectCount} matières\n`;
  explanation += `• J'ai priorisé les matières avec examens proches\n`;
  explanation += `• Sessions adaptées à tes créneaux disponibles\n`;
  explanation += `• Alternance des types de travail pour varier\n\n`;
  explanation += `🚀 Prêt à commencer ? Tu peux ajuster les créneaux si besoin !`;
  
  return explanation;
}