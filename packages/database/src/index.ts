import type { Counter } from '@netxpert/schema';

const counter: Counter = { value: 0 };

export function get(): Counter {
  return counter;
}

export function increment(): Counter {
  counter.value++;
  return counter;
}

export function decrement(): Counter {
  counter.value--;
  return counter;
}

export function reset(): Counter {
  counter.value = 0;
  return counter;
}

export function set(value: number): Counter {
  counter.value = value;
  return counter;
}