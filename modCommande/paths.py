import os
from uuid import uuid4


class PathsHelpers:
    PHOTO_FOLDER = "photo/"

    def path_and_rename(self, filename, upload_to):

        ext = filename.split(".")[-1]
        # get filename
        filename = f"{self.pk}.{ext}" if self.pk else f"{uuid4().hex}.{ext}"
        # return the whole path to the file
        return os.path.join(upload_to, filename)
