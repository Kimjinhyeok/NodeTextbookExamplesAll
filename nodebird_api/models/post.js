module.exports = (sequelize, Datatypes ) => (
    sequelize.define('post', {
        content : {
            type : Datatypes.STRING(140),
            allowNull : false
        },
        img : {
            type : Datatypes.STRING(200),
            allowNull : true
        }
    }, {
        timestamps : true,
        paranoid : true
    })
)