## Arrow Functions

A short hand notation for `function()`.

```javascript
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);
var pairs = evens.map(v => ({even: v, odd: v + 1}));

nums.forEach(v => {
  if (v % 5 === 0)
    fives.push(v);
});
```
