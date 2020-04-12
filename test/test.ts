function fibonacci(num:number):number {
  if (num <= 1) return 1;

  return fibonacci(num - 1) + fibonacci(num - 2);
}

console.log(fibonacci(40));