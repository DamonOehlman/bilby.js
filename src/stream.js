var Stream = function(f, o) {
    // Hmm... this is very much mutable!
    // Have to work out how a stream can listen to another stream that's already been created.
    var env = this;
    env.subs = [];
    f(function(a) {
        env.subs.forEach(function(s) {
            s(a);
        });
    });
};

Stream.of = function(a, b) {
    var unbinder,
        bounce;

    return new Stream(function(state) {
        unbinder = a(function() {
            bounce = b();
            if (!bounce.isDone) {
                state(bounce.thunk());
            } else {
                state(bounce.result);
                unbinder();
            }
        });
    });
};

Stream.prototype.foreach = function(f) {
    var env = this;
    return new Stream(function(state) {
        env.subs.push(function(a) {
            f(a);
            state(a);
        });
    });
};

Stream.prototype.map = function(f) {
    var env = this;
    return new Stream(function(state) {
        env.subs.push(function(a) {
            state(f(a));
        });
    });
};

Stream.prototype.toArray = function() {
    var accum = [];
    this.foreach(function(a) {
        accum.push(a);
    });
    return accum;
};

/**

  ## sequential

      Stream.sequential([1, 2, 3, 4]).foreach(function (a) {
        console.log(a);
      });
 */
Stream.sequential = function(values, delay) {
    var index = 0;
    return Stream.poll(function() {
        if (index >= values.length - 1) return done(values[index]);
        return cont(function() {
          return values[index++];
        });
    }, delay || 0);
};

/**

  ## poll

      Stream.poll(function() {
        return cont(function() {
            return bilby.method('arb', Number);
        })
      }).foreach(function (a) {
        console.log(a);
      });
 */
Stream.poll = function(pulse, delay) {
    return Stream.of(function(handler) {
        var id = setInterval(handler, delay);
        return function() {
            return clearInterval(id);
        };
    }, pulse);
};

bilby = bilby
  .property('Stream', Stream);
