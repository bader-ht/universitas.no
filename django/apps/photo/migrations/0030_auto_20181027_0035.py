# Generated by Django 2.1.2 on 2018-10-26 22:35

import apps.photo.cropping.boundingbox
from django.db import migrations
import utils.model_fields


class Migration(migrations.Migration):

    dependencies = [
        ('photo', '0029_auto_20181023_0021'),
    ]

    operations = [
        migrations.AlterField(
            model_name='imagefile',
            name='crop_box',
            field=utils.model_fields.CropBoxField(
                default=apps.photo.cropping.boundingbox.CropBox.basic,
                editable=False,
                help_text='How this image has been cropped.',
                verbose_name='crop box'
            ),
        ),
    ]