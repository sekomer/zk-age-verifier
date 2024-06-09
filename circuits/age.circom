pragma circom 2.0.0;

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    
    var lc1=0;
    var e2=1;

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }
    
    lc1 === in;
}

template LessThan(n) {
  assert(n <= 252);
  signal input in[2];
  signal output out;

  component toBits = Num2Bits(n+1);
  toBits.in <== ((1 << n) + in[0]) - in[1];

  out <== 1 - toBits.out[n];
}

template GreaterEqThan(n) {
  // [age, threshold]
  signal input in[2]; 
  signal output out;

  component toBits = Num2Bits(n);
  toBits.in <== in[0] - in[1];

  // Check if the highest bit is 0 (meaning non-negative)
  out <== 1 - toBits.out[n-1]; 
}

template AgeChecker(n) {
    signal input in;
    signal output out;

    var age = in;

    out <== GreaterEqThan(n)([age, n]);
}

component main = AgeChecker(18);
