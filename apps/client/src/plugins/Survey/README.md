**1. Setup instructions**

In the config.json in admin, you should see the following pieces of configuration for the survey plugin:


```
  "surveyhandler": {
    "url_surveys_mailtemplatelist": "https://kartaop2050admin.orebro.se/api/v2/surveys/mailtemplatelist/",
    "url_surveys_list": "https://kartaop2050admin.orebro.se/api/v2/surveys/list/",
    "url_surveys_load": "https://kartaop2050admin.orebro.se/api/v2/surveys/",
    "url_surveys_save": "https://kartaop2050admin.orebro.se/api/v2/surveys/",
    "url_surveys_answers_save": "https://kartaop2050admin.orebro.se/api/v2/surveys/answers/",
    "url_surveys_answers_load": "https://kartaop2050admin.orebro.se/api/v2/surveys/answers/"
  }
  
```

There is also a few settings to be made under "mapsettings":


```
"url_surveys_mailtemplatelist": "https://kartaop2050admin.orebro.se/api/v2/surveys/mailtemplatelist/",
"url_surveys_list": "https://kartaop2050admin.orebro.se/api/v2/surveys/list/",
"url_surveys_load": "https://kartaop2050admin.orebro.se/api/v2/surveys/",
"url_surveys_answers_save": "https://kartaop2050admin.orebro.se/api/v2/surveys/answers/",
"url_surveys_answers_load": "https://kartaop2050admin.orebro.se/api/v2/surveys/answers/"
```

Make sure these point to the correct URL.



Inside the AppData folder of the backend, add a folder called "surveys".

in the .env file, there are some settings regarding mailfunctionality that can be activated.

The plugin can either populate survey data into a database using the WFS-T protocol, or populate data into json files on the server. Bear in mind though that to this date only geometries and attributes to connect the database table to the json files are available. Part **2** describes the configuration procedure of using a database. If the json-file alternative is used, part **2** can be skipped.



**2.1 Setup in database (WFS-T)**

The plugin is tested using an Oracle enterprise database (v19), but should work with other databases as well.

A table is needed with the following columns and data types, it is specified using Oracle, but similar data types could be used for other databases:

ID (Integer, primary key, auto-incremented)

SURVEYID (varchar(200))

SURVEYANSWERID (varchar(200))

SURVEYANSWERDATE (DATE)

SURVEYQUESTION (VARCHAR(100))

SURVEYQUESTIONNAME (VARCHAR(20))

GEOMETRY (SDO_GEOMETRY)



**2.2 Setup WFS-T service (WFS)**

Setup a WFS-T service including the table that is previously created. It is tested using QGIS-Server but Geoserver should also work.



**2.3 Usage setup in admin (WFS)**

Setup an edit service in admin (Redigeringstjänster), make sure each attribute is editable.



**3.1 Setup a survey in admin (Enkäthanterare)**

There is a tab in admin you can use to create surveys under "Enkäthanterare". You can either reconfigure an existing survey or create a new one.


To create a new survey, write down the name of the survey file name in the field called "Enkätens filnamn". Bear in mind that if there is an existing survey with the same name, the previous survey will be overwritten.



Add a title and an URL for a logo.

The form starts out with a page already created. You can then add different questions to the page using the "LÄGG TILL FRÅGA" button. There are a few question types to choose from:

Text - A text field får the user to add text information in a single line.

E-post - A field where the user can input their email address.

Info - A user non-editable field where information can be added regarding the page.

Flerval - A multiple choice list. Add different choices using the "LÄGG TILL VAL" button.

Enkelval (radioknapp) - A list where only one choice can be chosen.

Betyg - A grading field where the user can input a grade from the configured steps and max value.

Kommentar - A text field where the user can input multi-line text.

Alla geometriverktyg - Buttons are added to provide the user with functions to add either a point, line or polygon geometry to the map.

Geometriverktyget punkt - A button is added to provide the user with functions to add a point geometry to the map.

Geometriverktyget linje- A button is added to provide the user with functions to add a line geometry to the map.

Geometriverktyget yta - A button is added to provide the user with functions to add a polygon geometry to the map.

Geometriverktyget punkt + position - A button is added to provide the user with functions to add a point geometry to the map or the users position.

For every question, you can also set whether the question is compulsory or not.



**3.2 Setup a survey in admin (Survey plugin)**

In the settings of each map, the plugin "Enkätverktyg" can for instance be activated to add the Survey plugin to the map.


A single survey can be added to the map using the "Välj enkät"-list.

If WFS-T functionality is to be used to store the information directly in the database, any WFS-T services added under the admin navigation tab "Redigeringstjänster" is available to choose from. Keep in mind that the WFS-T service has to be setup with the structure that is given by part **2**


**3.3 Setup a survey in admin (Survey plugin) Mailtemplates**

Some example mailtemplates are provided in the AppData/surveys/mailtemplates catalog. A mailtemplate needs to be chosen if the mailfunctionality is activated.
