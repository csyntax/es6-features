## Arrow Functions

A short hand notation for `function()`.

```javascript
let odds = evens.map(v => v + 1);
let nums = evens.map((v, i) => v + i);
let pairs = evens.map(v => ({
    even: v,
    odd: v + 1
}));

nums.forEach(v => {
  if (v % 5 === 0) {
      fives.push(v);
  }    
});
```
