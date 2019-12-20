const exists = async (model, filter) => {
    try {
        const instances = await model.find(filter);
        return !instances.length;
    } catch (error) {
        console.log(error);
    }
};

const findOrCreate = async (model, filter, data) => {
    try {
        const existsInstance = await exists(model, filter);
        let instance = null;
        if (!existsInstance) {
            instance = new model(data);
        } else {
            instance = await model.findOne(filter);
        }
        return [isNew, instance];
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    exists,
    findOrCreate
};