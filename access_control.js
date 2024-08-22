/* 
* This is a middleware function that restricts access to
* endpoints based on the role of the current session user
* bring provided and matching with the allowedRoles input.
*@pram{Array}
*/
export default function access_control(allowedRoles) {
    return function (request, response, next) {
      // is there a user logged in?
      if (request.session.user != null) {
        // is the user's access role in the list of allowed roles for this
        // end point contains the currently logged in user's role.
        if (allowedRoles.includes(request.session.user.accessRole)) {
          next();
        } else {
          response.render("status.ejs", {
            status: "Access Denied",
            message: "Invalid access role",
          });
        }
      } else {
        response.render("status.ejs", {
          status: "Access Denied",
          message: "Not logged in",
        });
      }
    };
  }
  