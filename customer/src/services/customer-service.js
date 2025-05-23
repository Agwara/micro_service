const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors')


// All Business logic will be here
class CustomerService {

    constructor(){
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs){

        const { email, password } = userInputs;
        
        try {
            
            const existingCustomer = await this.repository.FindCustomer({ email});

            if(existingCustomer){
            
                const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);
                
                if(validPassword){
                    const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id});
                    return FormateData({id: existingCustomer._id, token });
                } 
            }
    
            return FormateData(null);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }

       
    }

    async SignUp(userInputs){
        
        const { email, password, phone } = userInputs;
        
        try{
            // create salt
            let salt = await GenerateSalt();
            
            let userPassword = await GeneratePassword(password, salt);
            
            const existingCustomer = await this.repository.CreateCustomer({ email, password: userPassword, phone, salt});
            
            const token = await GenerateSignature({ email: email, _id: existingCustomer._id});

            return FormateData({id: existingCustomer._id, token });

        }catch(err){
            throw new APIError('Data Not found', err)
        }

    }

    async AddNewAddress(_id,userInputs){
        
        const { street, postalCode, city,country} = userInputs;
        
        try {
            const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city,country})
            return FormateData(addressResult);
            
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
        
    
    }

    async GetProfile(id){

        try {
            const existingCustomer = await this.repository.FindCustomerById({id});
            return FormateData(existingCustomer);
            
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetShopingDetails(id){

        try {
            const existingCustomer = await this.repository.FindCustomerById({id});
    
            if(existingCustomer){
               return FormateData(existingCustomer);
            }       
            return FormateData({ msg: 'Error'});
            
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetWishList(customerId){

        try {
            const wishListItems = await this.repository.Wishlist(customerId);
            return FormateData(wishListItems);
        } catch (err) {
            throw new APIError('Data Not found', err)           
        }
    }

    async AddToWishlist(customerId, product){
        try {
            const wishlistResult = await this.repository.AddWishlistItem(customerId, product);        
           return FormateData(wishlistResult);
    
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageCart(customerId, product, qty, isRemove){
        try {
            const cartResult = await this.repository.AddCartItem(customerId, product, qty, isRemove);        
            return FormateData(cartResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageOrder(customerId, order){
        try {
            const orderResult = await this.repository.AddOrderToProfile(customerId, order);
            return FormateData(orderResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async SubscribeEvents(payload){

        payload = JSON.parse(payload);

        // console.log("Payload customer subscriber", payload)
    
        try {
            const { event, data } =  payload;
            // console.log("Payload customer subscriber", "event: ", event, " data: ", data)

            const { userId, product, order, qty } = data;

            // console.log("Payload customer subscriber", event, data)
            // console.log("Payload customer subscriber", userId, product, order, qty)
    
            switch(event){
                case 'ADD_TO_WISHLIST':
                case 'REMOVE_FROM_WISHLIST':
                    this.AddToWishlist(userId,product)
                    break;
                case 'ADD_TO_CART':
                    this.ManageCart(userId,product, qty, false);
                    break;
                case 'REMOVE_FROM_CART':
                    this.ManageCart(userId,product,qty, true);
                    break;
                case 'CREATE_ORDER':
                    this.ManageOrder(userId,order);
                    break;  
                default:
                    break;
            }
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
 
    }

    // async SubscribeEvents(payload) {
    //     console.log('Triggering.... Customer Events');
    
    //     try {
    //         payload = JSON.parse(payload);

    //         console.log("Payload customer subscriber", payload)
    
    //         // Correctly destructure the nested structure
    //         const { event, data } = payload.data;
    //         // console.log('Event:', event);
    //         // console.log('Data:', data);
    
    //         if (!data) {
    //             console.error('Data is undefined or null');
    //             return;
    //         }
    
    //         const { userId, product, order, qty } = data;
    
    //         switch (event) {
    //             case 'ADD_TO_WISHLIST':
    //             case 'REMOVE_FROM_WISHLIST':
    //                 await this.AddToWishlist(userId, product);
    //                 break;
    //             case 'ADD_TO_CART':
    //                 await this.ManageCart(userId, product, qty, false);
    //                 break;
    //             case 'REMOVE_FROM_CART':
    //                 await this.ManageCart(userId, product, qty, true);
    //                 break;
    //             case 'CREATE_ORDER':
    //                 await this.ManageOrder(userId, order);
    //                 break;
    //             default:
    //                 console.warn('Unhandled event type:', event);
    //                 break;
    //         }
    //     } catch (error) {
    //         console.error('Error parsing payload or handling event:', error);
    //     }
    // }

}

module.exports = CustomerService;