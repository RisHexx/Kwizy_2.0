import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Sanitize control characters that LLMs sometimes embed inside JSON string values.
// These cause "Bad control character in string literal" errors on JSON.parse().
const sanitizeJsonString = (raw) => {
  return raw.replace(/[\x00-\x1F\x7F]/g, (ch) => {
    if (ch === '\n' || ch === '\r' || ch === '\t') return ' ';
    return '';
  });
};

export const generateQuiz = async (transcript, difficulty = 'medium', numQuestions = 10) => {
  const difficultyPrompts = {
    easy: 'Generate straightforward questions that test basic understanding and recall of the main concepts.',
    medium: 'Generate questions that test understanding and require some analysis of the content.',
    hard: 'Generate challenging questions that require deep understanding, critical thinking, and inference.'
  };

  const prompt = `You are an educational quiz generator. Based on the following video transcript, generate exactly ${numQuestions} quiz questions.
IMPORTANT: All questions, options, explanations, and text MUST be in English, even if the transcript is in another language.

${difficultyPrompts[difficulty]}

Mix of question types:
- 70% Multiple Choice Questions (MCQ) with 4 options (A, B, C, D)
- 30% True/False questions

For each question, provide:
1. The question text
2. The question type (mcq or true_false)
3. Options (for MCQ: array of 4 options; for true/false: ["True", "False"])
4. The correct answer (the actual text of the correct option)
5. A brief explanation of why this is correct
6. An approximate timestamp (in seconds) where this topic is discussed in the video

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "This is correct because...",
      "timestamp": 120
    },
    {
      "type": "true_false",
      "question": "Statement to evaluate",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "This is true because...",
      "timestamp": 180
    }
  ]
}

Video Transcript:
${transcript}

REMINDER: You MUST write ALL output (questions, options, explanations) in English. Do NOT use the language of the transcript. Respond with valid JSON only.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. You MUST generate all content in English, regardless of the language of the transcript. Never output questions or options in any other language. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4096
    });

    const responseText = completion.choices[0]?.message?.content || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz response');
    }

    const quizData = JSON.parse(sanitizeJsonString(jsonMatch[0]));
    return {
      success: true,
      questions: quizData.questions
    };
  } catch (error) {
    console.error('Groq quiz generation error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateFlashcards = async (transcript, numCards = 10) => {
  const prompt = `You are an educational flashcard generator. Based on the following video transcript, generate exactly ${numCards} flashcards that help users memorize key concepts.
IMPORTANT: All flashcard content MUST be in English, even if the transcript is in another language.

Each flashcard should have:
1. Front: A question or term
2. Back: The answer or definition
3. Timestamp: Approximate seconds into the video where this concept appears

Focus on:
- Key definitions and terms
- Important concepts and their explanations
- Notable facts and figures
- Main takeaways

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "cards": [
    {
      "front": "What is...?",
      "back": "The answer is...",
      "timestamp": 60
    }
  ]
}

Video Transcript:
${transcript}

REMINDER: You MUST write ALL output (front, back) in English. Do NOT use the language of the transcript. Respond with valid JSON only.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. You MUST generate all content in English, regardless of the language of the transcript. Never output flashcards in any other language. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2048
    });

    const responseText = completion.choices[0]?.message?.content || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse flashcards response');
    }

    const flashcardData = JSON.parse(sanitizeJsonString(jsonMatch[0]));
    return {
      success: true,
      cards: flashcardData.cards
    };
  } catch (error) {
    console.error('Groq flashcard generation error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateTitle = async (transcript) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You MUST generate a short, descriptive title in English only (max 60 characters) for a quiz based on this video content. Even if the transcript is in another language, the title MUST be in English. Return only the title text, nothing else.'
        },
        {
          role: 'user',
          content: transcript.substring(0, 2000) + '\n\nREMINDER: Generate the title in English only.'
        }
      ],
      temperature: 0.5,
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content?.trim() || 'Video Quiz';
  } catch (error) {
    console.error('Title generation error:', error.message);
    return 'Video Quiz';
  }
};
