export interface GetEventsParams {
  start: string;
  end: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  expiresAt: number;
}

export interface CalendarAdapter {
  getEvents(params: GetEventsParams): Promise<CalendarEvent[]>;
  refreshToken(token: string): Promise<RefreshTokenResult>;
}

export class FakeCalendarAdapter implements CalendarAdapter {
  private shouldError = false;

  setShouldError(value: boolean): void {
    this.shouldError = value;
  }

  async getEvents(params: GetEventsParams): Promise<CalendarEvent[]> {
    if (this.shouldError) {
      throw new Error('Fake calendar error');
    }

    return [
      {
        id: 'event-1',
        summary: 'Team standup',
        description: 'Daily team sync',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T09:30:00Z',
      },
      {
        id: 'event-2',
        summary: 'Lunch with Juan',
        description: 'San Telmo restaurant',
        start: '2024-01-15T12:30:00Z',
        end: '2024-01-15T13:30:00Z',
      },
    ];
  }

  async refreshToken(_token: string): Promise<RefreshTokenResult> {
    if (this.shouldError) {
      throw new Error('Token refresh failed');
    }

    return {
      accessToken: 'new-access-token-' + Date.now(),
      expiresAt: Date.now() + 3600000,
    };
  }
}
