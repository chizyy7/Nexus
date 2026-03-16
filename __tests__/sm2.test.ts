import { calculateSM2, Rating, SM2State } from "../lib/sm2";

describe("SM-2 Algorithm", () => {
  const defaultState: SM2State = {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("first review at each rating", () => {
    it("should reset on rating 0 (complete blackout)", () => {
      const result = calculateSM2(defaultState, 0);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should reset on rating 1 (incorrect, remembered on seeing answer)", () => {
      const result = calculateSM2(defaultState, 1);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it("should reset on rating 2 (incorrect, easy recall on seeing answer)", () => {
      const result = calculateSM2(defaultState, 2);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it("should succeed on rating 3 (correct, serious difficulty)", () => {
      const result = calculateSM2(defaultState, 3);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it("should succeed on rating 4 (correct, some hesitation)", () => {
      const result = calculateSM2(defaultState, 4);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should succeed on rating 5 (perfect response)", () => {
      const result = calculateSM2(defaultState, 5);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });
  });

  describe("failed review resetting state", () => {
    it("should reset repetitions and interval on failure after progress", () => {
      const progressedState: SM2State = {
        easeFactor: 2.5,
        interval: 15,
        repetitions: 4,
      };

      const result = calculateSM2(progressedState, 1);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should preserve ease factor on failure", () => {
      const state: SM2State = {
        easeFactor: 2.0,
        interval: 10,
        repetitions: 3,
      };

      const result = calculateSM2(state, 0);
      expect(result.easeFactor).toBe(2.0);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe("EF floor clamping", () => {
    it("should not let ease factor go below 1.3", () => {
      const lowEfState: SM2State = {
        easeFactor: 1.3,
        interval: 6,
        repetitions: 1,
      };

      const result = calculateSM2(lowEfState, 3);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("should clamp to 1.3 after repeated difficult reviews", () => {
      let state: SM2State = { ...defaultState };
      for (let i = 0; i < 20; i++) {
        const result = calculateSM2(state, 3);
        state = {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        };
      }
      expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("interval progression over multiple Good reviews", () => {
    it("should progress intervals correctly: 1 → 6 → 6*EF → ...", () => {
      let state: SM2State = { ...defaultState };

      // First review: interval should be 1
      const first = calculateSM2(state, 4);
      expect(first.interval).toBe(1);
      expect(first.repetitions).toBe(1);

      // Second review: interval should be 6
      state = { easeFactor: first.easeFactor, interval: first.interval, repetitions: first.repetitions };
      const second = calculateSM2(state, 4);
      expect(second.interval).toBe(6);
      expect(second.repetitions).toBe(2);

      // Third review: interval should be round(6 * EF)
      state = { easeFactor: second.easeFactor, interval: second.interval, repetitions: second.repetitions };
      const third = calculateSM2(state, 4);
      expect(third.interval).toBe(Math.round(6 * second.easeFactor));
      expect(third.repetitions).toBe(3);
    });
  });

  describe("nextReviewAt calculation", () => {
    it("should set nextReviewAt to now + interval days", () => {
      const result = calculateSM2(defaultState, 4);
      const expected = new Date("2025-01-01T00:00:00Z");
      expected.setDate(expected.getDate() + result.interval);
      expect(result.nextReviewAt.getTime()).toBe(expected.getTime());
    });
  });
});
