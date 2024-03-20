// Module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;

// Create engine
var engine = Engine.create(),
    world = engine.world;

// Adjust the renderer options for a smaller box
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 600, // Smaller width
        height: 400, // Smaller height
        wireframes: false // We want to see the colors
    }
});

// Adjust the ground and walls for the smaller box
var ground = Bodies.rectangle(300, 390, 610, 20, { isStatic: true }),
    leftWall = Bodies.rectangle(10, 200, 20, 400, { isStatic: true }),
    rightWall = Bodies.rectangle(590, 200, 20, 400, { isStatic: true });

World.add(world, [ground, leftWall, rightWall]);

// Function to create balls
function createBall(x, y, radius, type) {
    var ball = Bodies.circle(x, y, radius, {
        render: {
            fillStyle: type.color
        }
    });
    ball.ballType = type.name; // Custom property to identify the ball type
    ball.radius = radius; // Track radius for merging
    return ball;
}

// Define ball types
var ballTypes = [
    { name: 'type1', color: 'red', size: 10 },
    { name: 'type2', color: 'blue', size: 15 },
    { name: 'type3', color: 'green', size: 20 },
    { name: 'type4', color: 'yellow', size: 25 },
    { name: 'type5', color: 'purple', size: 30 },
    { name: 'type6', color: 'pink', size: 35 }
];

// Handle collision events
Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    pairs.forEach(function(pair) {
        var bodyA = pair.bodyA,
            bodyB = pair.bodyB;
        // Ensure both bodies are balls and of the same type
        if (bodyA.ballType && bodyB.ballType && bodyA.ballType === bodyB.ballType) {
            // Find the current type index
            var currentIndex = ballTypes.findIndex(type => type.name === bodyA.ballType);
            // Check if balls are of the largest size, and prevent merging if true
            if (currentIndex === ballTypes.length - 1) {
                // These are the largest balls, do nothing
                return; // Exit the function early
            }
            // Otherwise, proceed to upgrade to the next size/type
            var nextIndex = currentIndex + 1;
            var newX = (bodyA.position.x + bodyB.position.x) / 2;
            var newY = (bodyA.position.y + bodyB.position.y) / 2;
            // Remove the colliding balls
            World.remove(world, bodyA);
            World.remove(world, bodyB);
            // Create and add the new, upgraded ball
            var newType = ballTypes[nextIndex];
            var newBall = createBall(newX, newY, newType.size, newType);
            World.add(world, newBall);
        }
    });
});

// Run the engine
Engine.run(engine);

// Run the renderer
Render.run(render);

const fixedYPosition = 50; // Define this before using it to create the preview ball
var previewBall = null; // Declare the previewBall variable
var initialXPosition = render.options.width / 2;

// Update or create preview ball on mouse move
document.addEventListener('mousemove', function(event) {
    // Calculate the correct mouse X position relative to the canvas, accounting for page scroll
    var mouseX = event.clientX - render.canvas.getBoundingClientRect().left;
    // Ensure the preview ball follows the mouse's x position
    if (previewBall) {
        Matter.Body.setPosition(previewBall, { x: mouseX, y: fixedYPosition });
    }
});

// Drop the ball on click and create a new preview ball of random type
document.addEventListener('mousedown', function(event) {
    if (previewBall) {
        // Make the current preview ball non-static so it drops
        Matter.Body.setStatic(previewBall, false);
        // Recalculate the mouse X position at the time of click, considering page scroll
        var mouseX = event.clientX - render.canvas.getBoundingClientRect().left;
        // Set the dropped ball's position to the mouse's current x position
        Matter.Body.setPosition(previewBall, { x: mouseX, y: fixedYPosition });
    }
    // Select a random type for the new preview ball
    var randomTypeIndex = Math.floor(Math.random() * ballTypes.length);
    var randomBallType = ballTypes[randomTypeIndex];
    // Create a new preview ball at the updated mouse's current x position
    previewBall = createBall(initialXPosition, fixedYPosition, randomBallType.size, randomBallType);
    previewBall.isStatic = true; // Ensure it's static so it doesn't immediately fall
    World.add(world, previewBall); // Add it to the world for rendering
});

// Listen for the afterRender event of the render
Matter.Events.on(render, 'afterRender', function() {
    // Get the rendering context
    var ctx = render.context;
    if (previewBall) {
        // Coordinates of the ball
        var ballPosition = previewBall.position;
        // Draw a white line from the ball to the bottom of the canvas
        ctx.beginPath();
        ctx.moveTo(ballPosition.x, ballPosition.y); // Start at the ball's position
        ctx.lineTo(ballPosition.x, render.canvas.height); // Draw to the bottom of the canvas
        ctx.strokeStyle = 'white'; // Line color
        ctx.lineWidth = 2; // Line width
        ctx.stroke();
    }
});

// Create the initial preview ball
var initialXPosition = render.options.width / 2; // Start in the middle of the canvas
var typeIndex = 0; // Starting with the first type
var ballType = ballTypes[typeIndex];
previewBall = createBall(initialXPosition, fixedYPosition, ballType.size, ballType);
previewBall.isStatic = true; // Make the initial ball static
World.add(world, previewBall); // Add the initial preview ball to the world