**Overview**
Advanced tools for tracking and analyzing user behavior on websites such as Sentry exist. However, we find that Sentry is more concerned with modelling the high level interactions of users with websites, for use in debugging. On the other hand, we believe that there is value in desiging a low level model of user browsing behaviour. Complex interactions between a user and a website cannot always be captured on a high level interpretation. For instance, Sentry's capability to interface with video controls has the following problems: a website front-end designer may decide that serving videos in a custom element is suitable. In that case, Sentry may face issues recording use of video control. However, a recording of only low level user input (click, drag, etc) will form a consistent pattern that is indenpendant of website implementation. Therefore, there are benefits to our approach over Sentry's.

We take inspiration from the work produced by this recent paper: https://huggingface.co/datasets/McGill-NLP/WebLINX. WebLINX has opened new doorways when it comes to training on browsing data, allowing AI models to mimic human browsing. However, the data collected is still on a small scale and is fairly complex to handle. A database management system designed solely for gathering user browsing data can streamline the process of data collection and inference. Hence, the database is useful in real life context.

**Goals**

- Allow users to record their browsing sessions in-system to be uploaded to the database.
- Allow researchers to conduct research efficiently.
- Allow database administrators the power to manage database.

**Target Users**

The database application's target audience are data science researchers, specifically, people specializing in web analytics or clickstream Analytics. UX Researchers may also find use in our database.

_Data Science Researchers_ 
- Easier to observe patterns in low level inputs than inputs that may have more complex meaning. <mark>By storing information about inputs in a easily accessible format, researchers will be able to easily access and analyze the data. Researchers can easily filter out precisely what data they want to look at at apply operations by using the search function of the database. In specific, consider if we were to store the raw requests captured by the browser, a higher level interpretation of the communication between user and server through the browser. Constructing complex queries would require us to first dissect the meaning of requests, an issue that a low level representation will not face. </mark>

_UX Researchers_
- Useful for understanding how design tokens affect user interaction. <mark>The researchers can query from the database information about interactions related to specific parts of the UI to determine how changes influence user interaction. This is important for the case of design tokens, which operate at the level of System tokens, which determine basic attributes such as color and typography, to Component tokens which determine how the UI is composed. A low level representation allows us to take a bottom up approach to understanding how design tokens affect user interaction.</mark>

_Machine Learning_
- While we do not address directly, it is certainly possible to train models on our database. <mark>Our database gives a way to store user interaction data in a way that is easily inputable into a machine. This means that interested people can easily use it to train machine learning models related to user inputs.</mark>


**Justification for using RDBMS**
- On a high level understanding, the entities associated with a browsing session are highly related with each other. For example, a user click is inherently associated with a web page that the user is browsing on, and the html element that the user clicks on, and of course, the user click is associated with a user. This forms a rigid relationship between entities that we find is most efficiently represented by a relational schema. 
- A Relational Database Management System favours scaling vertically (i.e. adding more server resources). This is ideal as our users consist mainly of individual researchers who are likely to have such a system, rather than a large audience of concurrent consumers accessing the database, in which case horizontal scaling would be preferred.
- A researcher would benefit from the greater ease of performing join queries in database management systems.
- A consistent schema is beneficial for tracking historical user data (i.e. we can still perform research across many years since the base schema does not change)