describe('Basics', function() {
    it('should just work', function() {
        assert(true);
    });

    describe("Browser Window", function() {
        it('should confirm the window object exists', function() {
            assert(!!window);
        });
    });
});

describe('Fail Tests', function() {
    it('should fail', function() {
        assert(false);
    });

    it('should fail due to exception', function() {
        throw new Error("I'm an example error!");

        assert(true);
    });
});
