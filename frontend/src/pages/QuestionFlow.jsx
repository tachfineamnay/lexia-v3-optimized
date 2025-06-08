import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PopupQuestion from '../components/PopupQuestion';
import vertexAiService from '../api/vertexAiService';

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
      <div 
        ref={questionRef}
        className={`transition-all duration-300 ease-in-out transform ${animationClasses[animationState]}`}
      >
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium rounded px-2 py-1">
            {section.title}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {question.text}
        </h2>
        
        {question.description && (
          <p className="text-gray-600 mb-6">{question.description}</p>
        )}
        
        {question.type === 'text' ? (
          <div className="mb-6">
            <textarea
              name={question.questionId}
              value={answers[question.questionId] || ''}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre réponse..."
              required={question.required}
              onClick={() => openQuestionPopup(question)}
            ></textarea>
            {question.aiAssist && (
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <svg className="mr-1 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Cliquez pour éditer avec l'assistance IA
              </div>
            )}
          </div>
        ) : question.type === 'radio' ? (
          <div className="mb-6 space-y-2">
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${question.questionId}-${option.value}`}
                  name={question.questionId}
                  value={option.value}
                  checked={answers[question.questionId] === option.value}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required={question.required}
                />
                <label htmlFor={`${question.questionId}-${option.value}`} className="ml-3 block text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : question.type === 'select' ? (
          <div className="mb-6">
            <select
              name={question.questionId}
              value={answers[question.questionId] || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required={question.required}
            >
              <option value="">Sélectionnez une option</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              name={question.questionId}
              value={answers[question.questionId] || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre réponse..."
              required={question.required}
            />
          </div>
        )}
        
        {question.aiAssist && (
          <div className="mt-4 mb-6">
            <button
              type="button"
              onClick={() => openQuestionPopup(question)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Éditer avec l'assistant IA
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800">Erreur</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-yellow-800">Aucun questionnaire disponible</h2>
        <p className="text-yellow-700">Aucun questionnaire n'a été trouvé pour votre certification.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          {/* Progress bar and indicators */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700">
                Progression: {progress}%
              </div>
              <div className="text-sm font-medium text-gray-700">
                Section {currentSection + 1}/{questionSet.sections.length}
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="flex justify-between mt-6 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 bg-opacity-20 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm text-green-800">Documents</span>
              </div>
              <div className="flex-grow mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full" />
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm text-blue-800 font-medium">Questions</span>
              </div>
              <div className="flex-grow mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  3
                </div>
                <span className="ml-2 text-sm text-gray-500">Dossier</span>
              </div>
            </div>
          </div>

          {/* Current question */}
          {renderQuestion()}

          {/* Navigation buttons */}
          <div className="flex justify-between border-t border-gray-200 pt-6 mt-8">
            <button
              type="button"
              onClick={moveToPreviousQuestion}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Précédent
            </button>
            
            <button
              type="button"
              onClick={moveToNextQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {(currentSection === questionSet.sections.length - 1 && 
               currentQuestion === questionSet.sections[currentSection].questions.length - 1) ? (
                "Terminer"
              ) : (
                <>
                  Suivant
                  <svg className="ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Question popup for AI-assisted answers */}
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
    </div>
  );
}

export default QuestionFlow; 