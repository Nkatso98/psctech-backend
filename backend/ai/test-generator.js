const axios = require('axios');

/**
 * PSC Tech AI Test Generator Service
 * This service manages the generation of educational tests using AI
 */
class TestGenerator {
  constructor(apiKey = process.env.AI_SERVICE_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.AI_SERVICE_URL || 'https://api.psctech.ai/v1';
  }

  /**
   * Generate a test based on subject, grade and topics
   * @param {string} subject - The subject (e.g., "Mathematics", "Science")
   * @param {string} grade - The grade level (e.g., "Grade 8", "Grade 9")
   * @param {string[]} topics - Array of topics to cover in the test
   * @param {number} numberOfQuestions - Number of questions to generate
   * @returns {Promise<Object>} - Test object with questions and answers
   */
  async generateTest(subject, grade, topics, numberOfQuestions = 10) {
    try {
      const response = await axios.post(`${this.baseUrl}/generate-test`, {
        subject,
        grade,
        topics,
        numberOfQuestions,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating test:', error);
      throw new Error(`Failed to generate test: ${error.message}`);
    }
  }

  /**
   * Grade a completed test
   * @param {Object} test - Original test object
   * @param {Object} answers - Student's answers
   * @returns {Promise<Object>} - Graded test with feedback
   */
  async gradeTest(test, answers) {
    try {
      const response = await axios.post(`${this.baseUrl}/grade-test`, {
        test,
        answers
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error grading test:', error);
      throw new Error(`Failed to grade test: ${error.message}`);
    }
  }

  /**
   * Generate personalized feedback for a student based on test performance
   * @param {string} learnerId - The learner's ID
   * @param {Object} testResults - Results from a graded test
   * @returns {Promise<Object>} - Personalized feedback and improvement suggestions
   */
  async generateFeedback(learnerId, testResults) {
    try {
      const response = await axios.post(`${this.baseUrl}/generate-feedback`, {
        learnerId,
        testResults
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw new Error(`Failed to generate feedback: ${error.message}`);
    }
  }
  
  /**
   * Generate study materials based on test performance
   * @param {Object} testResults - Results from a graded test
   * @returns {Promise<Object>} - Study materials and resources
   */
  async generateStudyMaterials(testResults) {
    try {
      const response = await axios.post(`${this.baseUrl}/generate-materials`, {
        testResults
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating study materials:', error);
      throw new Error(`Failed to generate study materials: ${error.message}`);
    }
  }
}

module.exports = TestGenerator;