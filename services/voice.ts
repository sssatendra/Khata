/**
 * Voice Input Service
 * Speech-to-text for transaction entry (Hindi/English)
 */


interface VoiceResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://your-backend.com/api";

export const voiceService = {
  /**
   * Start voice recording and get transcription
   * Supports Hindi and English
   */
  async startVoiceInput(
    language: "en" | "hi" = "en",
    onPartialResult?: (result: VoiceResult) => void,
    onFinalResult?: (result: VoiceResult) => void,
  ): Promise<string> {
    try {
      // Use device's native speech-to-text
      // For Expo, we recommend integrating with Google Cloud Speech-to-Text

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

      if (!apiKey) {
        throw new Error("Google Cloud API key not configured");
      }

      // Get audio from device
      const audioBase64 = await getDeviceAudio();

      // Send to Google Cloud Speech-to-Text API
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio: {
              content: audioBase64,
            },
            config: {
              encoding: "LINEAR16",
              languageCode: language === "hi" ? "hi-IN" : "en-IN",
              model: "latest_long",
              enableAutomaticPunctuation: true,
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to transcribe");
      }

      const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";
      const confidence = data.results?.[0]?.alternatives?.[0]?.confidence || 0;

      return transcript;
    } catch (error) {
      console.error("Error in voice input:", error);
      throw error;
    }
  },

  /**
   * Parse voice command into transaction data
   * Examples:
   * - "Add five hundred rupees credit for Ramesh"
   * - "Payment of thousand from Geeta"
   * - "Udhar two fifty to Sharma"
   */
  parseVoiceCommand(transcript: string): {
    type: "credit" | "debit" | null;
    amount: number | null;
    customerName: string | null;
    confidence: "high" | "medium" | "low";
  } {
    try {
      const text = transcript.toLowerCase().trim();

      // Detect transaction type
      let type: "credit" | "debit" | null = null;
      if (
        text.includes("credit") ||
        text.includes("udhar") ||
        text.includes("given")
      ) {
        type = "credit";
      } else if (
        text.includes("payment") ||
        text.includes("paid") ||
        text.includes("debit")
      ) {
        type = "debit";
      }

      // Extract amount
      let amount: number | null = null;
      const amountMatch = extractAmount(text);
      if (amountMatch) {
        amount = amountMatch;
      }

      // Extract customer name
      let customerName: string | null = null;
      const forPattern =
        /(?:for|to|from)\s+([a-zA-Z\s]+?)(?:\s+(?:credit|payment|rupees|udhar)|$)/i;
      const match = text.match(forPattern);
      if (match && match[1]) {
        customerName = match[1].trim();
      }

      // Determine confidence
      let confidence: "high" | "medium" | "low" = "high";
      if (!type || !amount) {
        confidence = "low";
      } else if (!customerName) {
        confidence = "medium";
      }

      return {
        type,
        amount,
        customerName,
        confidence,
      };
    } catch (error) {
      console.error("Error parsing voice command:", error);
      return {
        type: null,
        amount: null,
        customerName: null,
        confidence: "low",
      };
    }
  },

  /**
   * Speak text aloud (text-to-speech)
   */
  async speak(text: string, language: "en" | "hi" = "en"): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/voice/speak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: language === "hi" ? "hi-IN" : "en-IN",
          rate: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to speak");
      }

      // In production, use native TTS
      // const audio = await response.arrayBuffer();
      // playAudio(audio);
    } catch (error) {
      console.error("Error speaking:", error);
    }
  },

  /**
   * Provide voice confirmation for transaction
   */
  async confirmTransaction(
    amount: number,
    customerName: string,
    type: "credit" | "debit",
  ): Promise<boolean> {
    try {
      const message =
        type === "credit"
          ? `Credit of ${amount} rupees to ${customerName}`
          : `Payment of ${amount} rupees from ${customerName}`;

      await this.speak(message, "en");

      // In production, wait for user response (yes/no)
      // For now, return true
      return true;
    } catch (error) {
      console.error("Error in transaction confirmation:", error);
      return false;
    }
  },

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{
    code: "en" | "hi";
    name: string;
  }> {
    return [
      { code: "en", name: "English" },
      { code: "hi", name: "हिंदी (Hindi)" },
    ];
  },

  /**
   * Check if speech recognition is available
   */
  async isSpeechRecognitionAvailable(): Promise<boolean> {
    try {
      // Check if device supports speech recognition
      // This would check device capabilities
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get voice input with visual feedback
   */
  async getVoiceInputWithUI(
    language: "en" | "hi" = "en",
    onStartRecording?: () => void,
    onStopRecording?: () => void,
  ): Promise<{
    transcript: string;
    parsed: {
      type: "credit" | "debit" | null;
      amount: number | null;
      customerName: string | null;
      confidence: "high" | "medium" | "low";
    };
    isFinal: boolean;
  }> {
    try {
      onStartRecording?.();

      // Record for 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));

      onStopRecording?.();

      const transcript = await this.startVoiceInput(language);
      const parsed = this.parseVoiceCommand(transcript);

      return {
        transcript,
        parsed,
        isFinal: true,
      };
    } catch (error) {
      console.error("Error getting voice input:", error);
      throw error;
    }
  },
};

/**
 * Helper: Extract amount from text
 */
function extractAmount(text: string): number | null {
  try {
    // Word numbers
    const wordMap: { [key: string]: number } = {
      zero: 0,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      hundred: 100,
      thousand: 1000,
      lakh: 100000,
    };

    // Hindi number words
    const hindiMap: { [key: string]: number } = {
      शून्य: 0,
      एक: 1,
      दो: 2,
      तीन: 3,
      चार: 4,
      पांच: 5,
      छः: 6,
      सात: 7,
      आठ: 8,
      नौ: 9,
      दस: 10,
      बीस: 20,
      तीस: 30,
      चालीस: 40,
      पचास: 50,
      सौ: 100,
      हज़ार: 1000,
      लाख: 100000,
    };

    // Merge maps
    const allWords = { ...wordMap, ...hindiMap };

    // Look for numeric patterns
    const numericMatch = text.match(/\d+/);
    if (numericMatch) {
      return parseInt(numericMatch[0], 10);
    }

    // Look for word patterns
    for (const [word, value] of Object.entries(allWords)) {
      if (text.includes(word)) {
        return value;
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting amount:", error);
    return null;
  }
}

/**
 * Helper: Get audio from device
 * This is a placeholder - implement with actual recording
 */
async function getDeviceAudio(): Promise<string> {
  try {
    // In production, use:
    // - expo-av for audio recording
    // - Convert WAV/M4A to base64
    // - Send to API

    // For now, return empty
    return "";
  } catch (error) {
    throw new Error("Failed to record audio");
  }
}

/**
 * Voice command examples for UI help
 */
export const VOICE_COMMAND_EXAMPLES = {
  en: [
    "Add five hundred rupees credit for Ramesh",
    "Payment of thousand from Geeta",
    "Udhar two fifty to Sharma",
    "Debit five hundred",
    "Credit three thousand to Kumar",
  ],
  hi: [
    "राजेश के लिए पाँच सौ रुपये क्रेडिट करें",
    "गीता से एक हज़ार का भुगतान",
    "शर्मा के लिए दो सौ पचास उधार",
    "पाँच सौ डेबिट करें",
    "कुमार के लिए तीन हज़ार क्रेडिट",
  ],
};
