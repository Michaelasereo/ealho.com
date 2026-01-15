/**
 * Daily.co Integration
 * 
 * This service handles creating and managing Daily.co video rooms for therapy sessions.
 * Daily.co is used instead of Google Meet for better performance in Nigeria.
 * 
 * Documentation: https://docs.daily.co/reference/rest-api
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = process.env.DAILY_API_URL || "https://api.daily.co/v1";

interface CreateRoomOptions {
  name?: string; // Room name (optional, auto-generated if not provided)
  privacy?: "private" | "public"; // Default: "private"
  properties?: {
    exp?: number; // Expiration timestamp (Unix timestamp)
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_screenshare?: boolean;
    enable_recording?: "cloud" | "local" | "none"; // For future AI notes feature
    max_participants?: number;
    owner_only_broadcast?: boolean;
  };
}

interface DailyRoom {
  id: string;
  name: string;
  api_created: boolean;
  privacy: "private" | "public";
  url: string;
  created_at: string;
  config: {
    exp?: number;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_screenshare?: boolean;
    enable_recording?: string;
    max_participants?: number;
  };
}

/**
 * Create a Daily.co room for a therapy session
 * 
 * @param options - Room creation options
 * @returns Daily.co room object with URL
 */
export async function createDailyRoom(
  options: CreateRoomOptions = {}
): Promise<DailyRoom> {
  if (!DAILY_API_KEY) {
    throw new Error("Daily.co API key not configured. Please set DAILY_API_KEY environment variable.");
  }

  const {
    name,
    privacy = "private",
    properties = {},
  } = options;

  // Set expiration to 24 hours from now by default
  const defaultExp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours

  const roomConfig = {
    privacy,
    properties: {
      exp: defaultExp,
      enable_chat: true,
      enable_knocking: false,
      enable_screenshare: true,
      enable_recording: "none", // Will enable when AI notes feature is ready
      max_participants: 10,
      ...properties,
    },
    ...(name && { name }),
  };

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify(roomConfig),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create Daily.co room: ${response.status} ${response.statusText}. ${errorData.error || ""}`
      );
    }

    const room: DailyRoom = await response.json();
    return room;
  } catch (error: any) {
    console.error("Error creating Daily.co room:", error);
    throw error;
  }
}

/**
 * Delete a Daily.co room
 * 
 * @param roomName - The name of the room to delete
 */
export async function deleteDailyRoom(roomName: string): Promise<void> {
  if (!DAILY_API_KEY) {
    throw new Error("Daily.co API key not configured");
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      // 404 is okay - room might already be deleted
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to delete Daily.co room: ${response.status} ${response.statusText}. ${errorData.error || ""}`
      );
    }
  } catch (error: any) {
    console.error("Error deleting Daily.co room:", error);
    throw error;
  }
}

/**
 * Get room information
 * 
 * @param roomName - The name of the room
 * @returns Room information
 */
export async function getDailyRoom(roomName: string): Promise<DailyRoom | null> {
  if (!DAILY_API_KEY) {
    throw new Error("Daily.co API key not configured");
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get Daily.co room: ${response.status} ${response.statusText}. ${errorData.error || ""}`
      );
    }

    const room: DailyRoom = await response.json();
    return room;
  } catch (error: any) {
    console.error("Error getting Daily.co room:", error);
    throw error;
  }
}
