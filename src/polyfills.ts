declare global {
  interface Array<T> {
    sum(): number;
    shuffle(): T[];
    random(): T;
    randomWeighted(selector: (item: T) => [any,number]): any;
    minBy(selector: (item: T) => number): T;
    maxBy(selector: (item: T) => number): T;
    countIf(predicate: (item: T) => boolean): number;
  }

  interface Math {
    clamp(value: number, min: number, max: number): number;
    randInt(maxExclusive: number): number;
    randWeighted(weights: number[]): number;
  }
}

Array.prototype.sum = function() {
  return this.reduce((a, c) => a + c, 0);
};

Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.randInt(i + 1);
    [this[i], this[j]] = [this[j], this[i]];
  }
  return this;
}

Array.prototype.random = function() {
  return this[Math.randInt(this.length)];
}

Array.prototype.randomWeighted = function(selector: (item: any) => [any,number]) {
  return selector(this[Math.randWeighted(this.map((item) => selector(item)[1]))])[0];
}

Array.prototype.minBy = function(selector: (item: any) => number) {
  return this.reduce((a, c) => (selector(a) <= selector(c) ? a : c));
}

Array.prototype.maxBy = function(selector: (item: any) => number) {
  return this.reduce((a, c) => (selector(a) >= selector(c) ? a : c));
}

Array.prototype.countIf = function(predicate: (item: any) => boolean) {
  return this.reduce((a, c) => (predicate(c) ? a + 1 : a), 0);
}

Math.clamp = function(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

Math.randInt = function(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

Math.randWeighted = function(weights: number[]) {
  const total = weights.sum();
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return i;
    }
    random -= weights[i];
  }
  return weights.length - 1;
}

export {};
