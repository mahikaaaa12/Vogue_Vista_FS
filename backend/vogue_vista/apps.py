import os
from django.contrib.admin.apps import AdminConfig
from django.contrib.auth.apps import AuthConfig
from django.contrib.contenttypes.apps import ContentTypesConfig

class MongoAdminConfig(AdminConfig):
    @property
    def default_auto_field(self):
        if os.environ.get("MONGODB_URI"):
            return "django_mongodb_backend.fields.ObjectIdAutoField"
        return "django.db.models.AutoField"

class MongoAuthConfig(AuthConfig):
    @property
    def default_auto_field(self):
        if os.environ.get("MONGODB_URI"):
            return "django_mongodb_backend.fields.ObjectIdAutoField"
        return "django.db.models.AutoField"

class MongoContentTypesConfig(ContentTypesConfig):
    @property
    def default_auto_field(self):
        if os.environ.get("MONGODB_URI"):
            return "django_mongodb_backend.fields.ObjectIdAutoField"
        return "django.db.models.AutoField"
