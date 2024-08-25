import * as tf from '@tensorflow/tfjs';

export type NNState = [number, number, number];
export type NNAction = [0 | 1, 0 | 1, 0 | 1, 0 | 1];

export class BotNeuralNetwork {
    private _model: tf.LayersModel;
    private _trainingData: Array<{ state: NNState, action: NNAction }> = [];
    private _isTraining = false;

    constructor() {
        console.log('Initializing bot neural network...');
        this._model = this.createModel();
    }

    get isTraining() {
        return this._isTraining;
    }

    /**
     * Predicts the bot's next action based on the current state.
     * 
     * @param x X-coordinate of the bot
     * @param y Y-coordinate of the bot
     * @param playerX X-coordinate of the player
     * @param playerY Y-coordinate of the player
     * @returns Predicted action
     */
    public predict(inputs: NNState) {
        const state = tf.tensor2d([inputs]);

        // Predict the bot's next action based on the current state
        const prediction = this._model.predict(state) as tf.Tensor;
        const output = prediction.dataSync();

        // Clean up tensors to free memory
        state.dispose();
        prediction.dispose();

        return Array.from(output);
    }

    /**
     * Collects the training data for the model.
     * 
     * @param state Current state of the bot
     * @param action Action taken by the bot
     */
    public collectTrainingData(state: NNState, action: NNAction): void {
        this._trainingData.push({ state, action });
    }

    /**
     * Trains the model with the collected training data.
     * 
     * @returns Training result
     */
    public async trainModel(): Promise<tf.History> {
        console.log('Training model...');
        const states = tf.tensor2d(this._trainingData.map(d => d.state));
        const actions = tf.tensor2d(this._trainingData.map(d => d.action));
        const reshapedActions = actions.reshape([actions.shape[0], 4]);

        this._isTraining = true;

        // Train the model using the states and actions
        const result = await this._model.fit(states, reshapedActions, {
            epochs: 1,  // Train for 1 epoch
            validationSplit: 0.2,  // Use a validation split to monitor overfitting
            callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 5 })  // Early stopping
        });

        console.log('Loss:', result.history.loss[0]);
        console.log('Validation Loss:', result.history.val_loss ? result.history.val_loss[0] : 'N/A');
        console.log('Epochs:', result.epoch.length);

        // Clear the training data after training
        this._trainingData = [];

        // Clean up tensors to free memory
        states.dispose();
        actions.dispose();
        reshapedActions.dispose();

        this._isTraining = false;

        return result;
    }

    /**
     * Creates the neural network model with layers.
     * 
     * @returns Configured neural network model
     */
    private createModel(): tf.LayersModel {
        console.log('Creating model...');
        const model = tf.sequential();

        // Input layer with 3 units for the state
        model.add(tf.layers.dense({ inputShape: [3], units: 256, activation: 'swish' }));
        
        // Hidden layers with more units and dropout layers
        model.add(tf.layers.dense({ units: 512, activation: 'swish' }));
        model.add(tf.layers.dense({ units: 256, activation: 'swish' }));

        // Output layer with 4 units for the predicted action
        model.add(tf.layers.dense({ units: 4, activation: 'sigmoid' }));

        // Compile the model with Adam optimizer and binary crossentropy loss
        const optimizer = tf.train.adam(0.01);
        model.compile({ optimizer, loss: 'binaryCrossentropy', metrics: ['accuracy'] });

        console.log('Model created successfully!');

        return model;
    }
}
