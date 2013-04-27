
    p2.Solver = function(){
        this.equations = [];
    };
    p2.Solver.prototype.solve = function(dt,world){ return 0; };
    p2.Solver.prototype.addEquation = function(eq){
        this.equations.push(eq);
    };
    p2.Solver.prototype.removeEquation = function(eq){
        var i = this.equations.indexOf(eq);
        if(i!=-1)
            this.equations.splice(i,1);
    };
    p2.Solver.prototype.removeAllEquations = function(){
        this.equations = [];
    };
