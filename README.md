# sync-spoon
A Food waste management solution for hostel messes. 
*A self Hosted Solution*

# Important:
- If you are using the site and It's not working appropriately, **Then It could be due to the fact that I don't run the backend servers 24x7**, as this is not feasible for me. 
- If you want to use the Site. Ping/DM me at the below Sites:
- [Akhil-Sharma on Linkedin](https://www.linkedin.com/in/akhil-sharma-858a71249/)
- [Akhil-Sharma on X](https://x.com/akhil_shar84418)


# For contributing to this project:
1. First of all make an issue about what feature you want to implement or update.
2. Then Make a pull request, telling what feature is being implemented and How. Describe the changes in detail.
3. Make sure you document your changes.
4. **Below are the step on How to run this project in your device:** 


## How to run the project:
Make sure you have installed the following:
1. BunJS
2. Python3 and python3.10

### Follow the steps to use the application Locally:
1. Clone the repo

> ### You have to start 3 servers to run this project. The steps are:

2. Go to `/client` folder and run `bun install` and then `bun run dev`. It will start the frontend server.

3. Go to `/server` folder and run `bun install` and then you will require the db key which is not in the repo. So, you have to ask for it. Contact me at: `akhil26sharma04@gmail.com`. Then run `bun run dev`. It will start the backend server.

4. Go to `/ml` folder and make a virtual envirnment by using the command: `source venv/bin/activate`. Then install packages by running `pip install -r requirements.txt`. Then run the server by going to the `/scripts` folder and running `python3.10 server.py`. It will start the ml server.

5. Now, you can access the project at `localhost:5173`.

### What has been implemented:
1. Student menu showing page.
2. Auth
3. feedback of any day menu
4. consumption data input
5. nav bar acc to user
6. User's All things are now implemented ig
7. Feedback data showen beautifully in admin dashboard
8. Admin can see all the feedbacks  
9. consumption record is working

> The Below features with *DONE* are implemented and working fine.

## What currently implementing:
1. admin dashboard :
  - viewing the reports *DONE*
  - manage the users *DONE*
  - create the monthly/waste report. *DONE*
  - creating suggesting menu -> then conform that they want it or not *DONE*
  - feedback data more properly shown 
  - Uploading of csv files *DONE*
  - visualize the consumption data. *DONE*
  - holiday schedule *DONE*
  - FeedBack data will be showen with meal type and with a better graph which shows the reating also *DONE*
2. register only students, not admins *DONE*
3. Mess staff dashboard
  - show suggesting menu 
  - view menu items with the stock consumed
  - Uploading of csv files *DONE*
  - enter the consumption data. *DONE*
  - enter date range for the consompution data and then add the data.


## Bugs
1. When I first reload the admin dashboard, everything is working fine but then if I go to the home page and then again access the admin dashboard, it is not working properly. I think it is because of the useEffect in the admin dashboard. The error coming is that the number of hooks or the seq of hooks is not matching. idk what it is, its my first time seeing this error.
-- RESOLVED: actually I was using two auth funtions :)
2. There is bug which is letting the ADMIN access some page but not the MESS_STAFF. I tried everything but it's not resolving. Its' showing up only in /see-menu. Adding it to the // TODO
3. userRole not being checked in flask server bug.
4. login/ signup navigation bugs. -- RESOLVED
3. the nav menu dashboard bug. -- RESOLVED
