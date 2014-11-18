# -*- coding: utf-8 -*-
# Python standard library
# import os
import re

# Django core
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.core.validators import MaxValueValidator, MinValueValidator
# from django.conf import settings
# Installed apps
from model_utils.models import TimeStampedModel
from sorl.thumbnail import ImageField
# Project apps
from myapps.contributors.models import Contributor, Position

import logging
logger = logging.getLogger('universitas')

class ImageFile(TimeStampedModel):
    # TODO: Define fields here

    class Meta:
        verbose_name = _('ImageFile')
        verbose_name_plural = _('ImageFiles')

    source_file = ImageField(
        upload_to='',
        height_field='full_height',
        width_field='full_width',
        max_length=1024,
    )
    full_height = models.PositiveIntegerField(
        help_text=_('full height in pixels'),
        verbose_name=_('full height'),
        editable=False,
    )
    full_width = models.PositiveIntegerField(
        help_text=_('full height in pixels'),
        verbose_name=_('full height'),
        editable=False,
    )
    vertical_centre = models.PositiveSmallIntegerField(
        default=50,
        help_text=_('image crop vertical. Between 0% and 100%.'),
        validators=[MaxValueValidator(100), MinValueValidator(0)],
    )
    horizontal_centre = models.PositiveSmallIntegerField(
        default=50,
        help_text=_('image crop horizontal. Between 0% and 100%.'),
        validators=[MaxValueValidator(100), MinValueValidator(0)],
    )
    manual_crop = models.BooleanField(
        default=False,
        help_text=_('this image has been manually cropped'),
        verbose_name=_('manual cropping'),
    )
    old_file_path = models.CharField(
        help_text=_('previous path if the image has been moved.'),
        blank=True, null=True,
        max_length=1000)
    contributor = models.ForeignKey(
        Contributor,
        help_text=_('who made this'),
        blank=True, null=True,
    )
    copyright_information = models.CharField(
        help_text=_('extra information about license and attribution if needed.'),
        blank=True, null=True,
        max_length=1000,
    )

    def get_crop(self):
        return '{h}% {v}%'.format(h=self.horizontal_centre, v=self.vertical_centre)

    def __str__(self):
        # file name only
        return self.source_file.name.rpartition('/')[-1]

    def identify_photo_file_initials(self, contributors=(),):
        """
        If passed a file path that matches the Universitas format for photo credit.
        Searches database or optional iterable of contributors for a person that
        matches initials at end of jpg-file name
        """
        filename_pattern = re.compile(r'^.+[-_]([A-ZÆØÅ]{2,5})\.jp.?g$')
        match = filename_pattern.match(self.source_file.name)
        if match:
            initials = match.groups()[0]
            for contributor in contributors:
                if contributor.initials == initials:
                    return contributor
            try:
                return Contributor.objects.get(initials=initials)
            except (ObjectDoesNotExist, MultipleObjectsReturned) as e:
                logger.warning(self, initials, e)

        return None

    def save(self, *args, **kwargs):
        if self.contributor is None:
            pass
            # self.contributor = self.identify_photo_file_initials()
        if kwargs.pop('autocrop', False):
            self.manual_crop = False
        try:
            saved_self = type(self).objects.get(id=self.pk)

            if (self.horizontal_centre != saved_self.horizontal_centre or self.vertical_centre !=
                    saved_self.vertical_centre):
                self.manual_crop = True
        except ObjectDoesNotExist:
            pass
        super().save(*args, **kwargs)

    def calculate_crop(self):
        """ Calculates best crop using a clever algorithm. """
        if self.manual_crop:
            return
        horizontal = 50 # ok - so it's not very clever...
        vertical = 50 # maybe I'll try to make something based on the reddit thumbnail algorithm.

        self.horizontal_centre = horizontal
        self.vertical_centre = vertical
        self.save(update_fields=['vertical_centre', 'horizontal_centre'], autocrop=True,)
