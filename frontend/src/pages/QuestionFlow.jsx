import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import PopupQuestion from '../components/PopupQuestion';
import LoadingSpinner from '../components/LoadingSpinner';
import aiService from '../api/aiService';

function QuestionFlow() {
  const [questionSet, setQuestionSet] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationState, setAnimationState] = useState('enter'); // 'enter', 'active', 'exit'
  const [progress, setProgress] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isQuestionPopupOpen, setIsQuestionPopupOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const questionRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the active question set
    const fetchQuestionSet = async () => {
      try {
        const response = await fetch('/api/questions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des questions');
        }

        const data = await response.json();
        if (data.questionSets && data.questionSets.length > 0) {
          // Fetch the full question set with the first one as default
          const fullSetResponse = await fetch(`/api/questions/${data.questionSets[0]._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!fullSetResponse.ok) {
            throw new Error('Erreur lors de la récupération du questionnaire complet');
          }
          
          const fullSetData = await fullSetResponse.json();
          setQuestionSet(fullSetData.questionSet);
          
          // Initialize answers object with empty values
          const initialAnswers = {};
          fullSetData.questionSet.sections.forEach(section => {
            section.questions.forEach(question => {
              initialAnswers[question.questionId] = '';
            });
          });
          setAnswers(initialAnswers);
        } else {
          throw new Error('Aucun questionnaire disponible');
        }
      } catch (err) {
        console.error('Error fetching question set:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSet();
  }, []);

  useEffect(() => {
    // Scroll to question when it changes
    if (questionRef.current) {
      setTimeout(() => {
        questionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [currentQuestion, currentSection]);

  useEffect(() => {
    // Update progress percentage
    if (questionSet) {
      let totalQuestions = 0;
      let answeredQuestions = 0;
      
      questionSet.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
          totalQuestions++;
          if (
            (sectionIndex < currentSection) || 
            (sectionIndex === currentSection && questionIndex <= currentQuestion) ||
            (answers[question.questionId] && answers[question.questionId].trim() !== '')
          ) {
            answeredQuestions++;
          }
        });
      });
      
      setProgress(Math.round((answeredQuestions / totalQuestions) * 100));
    }
  }, [currentSection, currentQuestion, answers, questionSet]);

  // Handle animation transitions for questions
  useEffect(() => {
    if (animationState === 'enter') {
      // Wait a short amount of time before making the question active
      const timer = setTimeout(() => {
        setAnimationState('active');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnswers({
      ...answers,
      [name]: value
    });
  };

  const openQuestionPopup = (question) => {
    setSelectedQuestion(question);
    setIsQuestionPopupOpen(true);
  };

  const closeQuestionPopup = () => {
    setIsQuestionPopupOpen(false);
    setSelectedQuestion(null);
  };

  const handleSaveAnswer = (answer) => {
    if (!selectedQuestion) return;
    
    setAnswers({
      ...answers,
      [selectedQuestion.questionId]: answer
    });
  };

  const moveToNextQuestion = () => {
    if (!questionSet) return;

    // Start exit animation
    setAnimationState('exit');
    
    setTimeout(() => {
      // Check if there are more questions in this section
      const currentSectionData = questionSet.sections[currentSection];
      if (currentQuestion < currentSectionData.questions.length - 1) {
        // Move to next question in the same section
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentSection < questionSet.sections.length - 1) {
        // Move to first question of next section
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      } else {
        // We're at the end, go to the final page
        navigate('/final-dossier');
        return;
      }
      
      // Reset animation state for the new question
      setAnimationState('enter');
    }, 300); // Match the CSS transition duration
  };

  const moveToPreviousQuestion = () => {
    if (!questionSet) return;

    // Start exit animation
    setAnimationState('exit');
    
    setTimeout(() => {
      // Check if there are previous questions in this section
      if (currentQuestion > 0) {
        // Move to previous question in the same section
        setCurrentQuestion(currentQuestion - 1);
      } else if (currentSection > 0) {
        // Move to last question of previous section
        setCurrentSection(currentSection - 1);
        setCurrentQuestion(questionSet.sections[currentSection - 1].questions.length - 1);
      } else {
        // We're at the beginning, go back to uploads
        navigate('/upload-documents');
        return;
      }
      
      // Reset animation state for the new question
      setAnimationState('enter');
    }, 300); // Match the CSS transition duration
  };

  const generateAiSuggestion = async () => {
    if (!questionSet) return;
    
    const currentQuestionData = questionSet.sections[currentSection].questions[currentQuestion];
    
    // If there's no AI prompt, don't try to generate
    if (!currentQuestionData.aiPrompt) return;
    
    setIsGeneratingSuggestion(true);
    setAiSuggestion(null);
    
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: currentQuestionData.aiPrompt,
          questionId: currentQuestionData.questionId,
          currentAnswer: answers[currentQuestionData.questionId] || ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de suggestion');
      }
      
      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (err) {
      console.error('Error generating AI suggestion:', err);
      setAiSuggestion('Désolé, une erreur est survenue lors de la génération de la suggestion.');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion || !questionSet) return;
    
    const currentQuestionData = questionSet.sections[currentSection].questions[currentQuestion];
    setAnswers({
      ...answers,
      [currentQuestionData.questionId]: aiSuggestion
    });
    
    setAiSuggestion(null);
  };

  const renderQuestion = () => {
    if (!questionSet) return null;
    
    const section = questionSet.sections[currentSection];
    const question = section.questions[currentQuestion];
    
    // Apply CSS classes based on animation state
    const animationClasses = {
      enter: 'opacity-0 translate-x-10',
      active: 'opacity-100 translate-x-0',
      exit: 'opacity-0 -translate-x-10'
    };

    return (
      <motion.div 
        ref={questionRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`transition-all duration-300 ease-in-out transform ${animationClasses[animationState]}`}
      >
        {/* Section Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium rounded-xl px-4 py-2 backdrop-blur-xl">
            <DocumentTextIcon className="h-4 w-4" />
            {section.title}
          </span>
        </motion.div>
        
        {/* Question Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-white mb-3"
        >
          {question.text}
        </motion.h2>
        
        {/* Question Description */}
        {question.description && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 mb-8 text-lg leading-relaxed"
          >
            {question.description}
          </motion.p>
        )}
        
        {/* Question Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          {question.type === 'text' ? (
            <div className="relative">
              <textarea
                name={question.questionId}
                value={answers[question.questionId] || ''}
                onChange={handleInputChange}
                rows="8"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all backdrop-blur-xl resize-none"
                placeholder="Votre réponse détaillée..."
                required={question.required}
                onClick={() => openQuestionPopup(question)}
              />
              {question.aiAssist && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-sm text-purple-300 flex items-center gap-2"
                >
                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                  Cliquez pour éditer avec l'assistance IA
                </motion.div>
              )}
            </div>
          ) : question.type === 'radio' ? (
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <motion.div 
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center group"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      id={`${question.questionId}-${option.value}`}
                      name={question.questionId}
                      value={option.value}
                      checked={answers[question.questionId] === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                      required={question.required}
                    />
                    <label 
                      htmlFor={`${question.questionId}-${option.value}`}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-purple-400/50 transition-all backdrop-blur-xl group-hover:bg-white/10"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        answers[question.questionId] === option.value 
                          ? 'border-purple-400 bg-purple-400' 
                          : 'border-white/20 bg-transparent'
                      }`}>
                        {answers[question.questionId] === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-white font-medium">{option.label}</span>
                    </label>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : question.type === 'select' ? (
            <div className="relative">
              <select
                name={question.questionId}
                value={answers[question.questionId] || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all backdrop-blur-xl appearance-none"
                required={question.required}
              >
                <option value="" className="bg-gray-800">Sélectionnez une option</option>
                {question.options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : (
            <input
              type="text"
              name={question.questionId}
              value={answers[question.questionId] || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all backdrop-blur-xl"
              placeholder="Votre réponse..."
              required={question.required}
            />
          )}
        </motion.div>
        
        {/* AI Assistant Button */}
        {question.aiAssist && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => openQuestionPopup(question)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-xl font-semibold hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all backdrop-blur-xl"
            >
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
              Éditer avec l'assistant IA
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <LoadingSpinner size="lg" color="primary" />
          <p className="text-gray-300 mt-4 text-lg">Chargement du questionnaire...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Réessayer
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Aucun questionnaire disponible</h2>
            <p className="text-yellow-300">Aucun questionnaire n'a été trouvé pour votre certification.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Questionnaire VAE
          </h1>
          <p className="text-gray-300 text-xl">
            Répondez aux questions pour construire votre dossier de validation
          </p>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
            {/* Progress indicators */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-purple-400" />
                <span className="text-white font-semibold">Progression: {progress}%</span>
              </div>
              <div className="text-white font-semibold">
                Section {currentSection + 1}/{questionSet.sections.length}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            
            {/* Steps indicator */}
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  <CheckIcon className="h-5 w-5" />
                </div>
                <span className="ml-3 text-green-400 font-semibold">Documents</span>
              </motion.div>
              
              <div className="flex-grow mx-4 h-2 bg-white/10 rounded-full">
                <div className="h-full bg-green-500 w-full rounded-full" />
              </div>
              
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
                <span className="ml-3 text-white font-semibold">Questions</span>
              </motion.div>
              
              <div className="flex-grow mx-4 h-2 bg-white/10 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-gray-400 font-bold">
                  3
                </div>
                <span className="ml-3 text-gray-400 font-semibold">Dossier</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
        >
          <div className="p-8">
            {/* Current question */}
            {renderQuestion()}

            {/* Navigation buttons */}
            <div className="flex justify-between border-t border-white/10 pt-8 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={moveToPreviousQuestion}
                className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all backdrop-blur-xl"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Précédent
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={moveToNextQuestion}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                {(currentSection === questionSet.sections.length - 1 && 
                 currentQuestion === questionSet.sections[currentSection].questions.length - 1) ? (
                  <>Terminer</>                
                ) : (
                  <>
                    Suivant
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Question popup for AI-assisted answers */}
        <AnimatePresence>
          {isQuestionPopupOpen && selectedQuestion && (
            <PopupQuestion
              isOpen={isQuestionPopupOpen}
              onClose={closeQuestionPopup}
              question={selectedQuestion}
              initialAnswer={answers[selectedQuestion.questionId] || ''}
              onSave={handleSaveAnswer}
              advice={selectedQuestion.advice || null}
              section={questionSet?.sections[currentSection]?.title}
              userData={user}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default QuestionFlow; 