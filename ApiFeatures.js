class Apifeatures {
     constructor(query, queryStr) {
          this.query = query;
          this.queryStr = queryStr;
     }
     filter() {
          let queryObj = { ...this.queryStr };
          const sort = queryObj.sort;
          console.log(queryObj);
          delete queryObj.sort;
          delete queryObj.fields
          delete queryObj.page;
          delete queryObj.limit;
          console.log(queryObj);

          let queryString = JSON.stringify(queryObj);
          console.log(queryString);

          queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
          console.log(queryString);

          let queryObj2 = JSON.parse(queryString);
          this.query = this.query.find(queryObj2);
          return this;
     }
     sort(){
          if (this.queryStr.sort) {
               const sortBy = this.queryStr.sort.split(',').join(' ');
               this.query =this.query.sort(sortBy);
               // console.log("this is:"+query);
          }
          return this;
     }
     fields(){
          if(this.queryStr.fields){
               const fields = this.queryStr.fields.split(',').join(' ');
               this.query =this.query.select(fields);
          }
          return this;
     }
     pagination(){
          const page=this.queryStr.page*1||1;
        const limit=this.queryStr.limit*1||query.length;
        const skip=(page -1) * limit;
        this.query =this.query.skip(skip).limit(limit);
     //    console.log("slip:"+skip + " limit:"+limit+" page:"+page+" queeryn:"+query);
            
     //     if(req.query.page){
     //        const count = User.countDocuments();
     //        if(skip>=count){
     //            throw new Error("skip is higher than limit")
     //     }}
           return this;
     }
}
module.exports = Apifeatures;