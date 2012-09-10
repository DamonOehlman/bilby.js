bilby = bilby
    .method('<', isFunction, function(a, b) {
        return compose(b, a);
    })
    .method('*', isFunction, function(a, b) {
        return function(x) {
            return a(x)(b(x));
        };
    });

bilby = bilby
    .method('>>', isFunction, function(a, b) {
        var env = this;
        return function(x) {
            return env['>='](a(x), b);
        };
    })

    .method('equal', bilby.liftA2(or, isNumber, isString), function(a, b) {
        return a == b;
    })
    .method('equal', isArray, function(a, b) {
        var env = this;
        return env.fold(zip(a, b), true, function(a, t) {
            return a && env.equal(t[0], t[1]);
        });
    })

    .method('fold', isArray, function(a, b, c) {
        var i;
        for(i = 0; i < a.length; i++) {
            b = c(b, a[i]);
        }
        return b;
    })

    .method('>=', isArray, function(a, b) {
        var accum = [],
            i;

        for(i = 0; i < a.length; i++) {
            accum = accum.concat(b(a[i]));
        }

        return accum;
    })
    .method('<', isArray, function(a, b) {
        var accum = [],
            i;

        for(i = 0; i < this.length; i++) {
            accum[i] = b(this[i]);
        }

        return accum;
    })
    .method('*', isArray, function(a, b) {
        var accum = [],
            i,
            j;

        for(i = 0; i < a.length; i++) {
            for(j = 0; j < b.length; j++) {
                accum.push(a[i](b[j]));
            }
        }

        return accum;
    })
    .method('+', isArray, function(a, b) {
        return a.concat(b);
    })

    .method('+', bilby.liftA2(or, isNumber, isString), function(a, b) {
        return a + b;
    });

Do.setValueOf(Array.prototype);
Do.setValueOf(Function.prototype);
