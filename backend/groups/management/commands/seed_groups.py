import random
import datetime

from django.core.management import BaseCommand
from django.contrib.admin.utils import flatten
from django_seed import Seed
from users.models import User
from tags.models import Tag
from groups.models import Group, GroupCert
from workouts.models import FitElement

class Command(BaseCommand):
    help = "This command creates many groups"

    def add_arguments(self, parser):
        parser.add_argument("-n", "--number", type=int, default=0, help="# of groups to create.")

    def handle(self, *args, **options):
        number = options.get("number")
        seeder = Seed.seeder()

        all_users = User.objects.all()

        seeder.add_entity(
            Group,
            number,
            {
                "group_name": lambda x: seeder.faker.company(),
                "group_leader": lambda x: random.choice(all_users),
                "number": lambda x: random.randint(50,100),
                "start_date": lambda x: seeder.faker.date_between_dates(
                    datetime.datetime(2022, 1, 1), datetime.datetime(2022, 7, 1)
                ),
                "end_date": lambda x: seeder.faker.date_between_dates(
                    datetime.datetime(2022, 7, 2), datetime.datetime(2023, 12, 30)
                ),
                "description": lambda x: seeder.faker.sentence(),
                "free": lambda x: bool(random.getrandbits(1)),
                "lat": lambda x: random.randint(32,38),
                "lng": lambda x: random.randint(127,129),
                "address": lambda x: seeder.faker.address(),
            },
        )

        created_groups_ = seeder.execute()
        created_groups = flatten(list(created_groups_.values()))

        for group_pk in created_groups:
            group = Group.objects.get(pk=group_pk)
            print(group)
            #members add
            for user in User.objects.order_by("?"):
                if random.randint(1, 10) <= 1:
                    group.members.add(user)

            #goal add
            for tag in Tag.objects.all():
                if random.randint(1, 100) <= 1:
                    fit = FitElement(
                            author=group.group_leader,
                            type='goal',
                            workout_type=tag,
                            weight=100,
                            rep=10,
                            set=10,
                            time=10,
                        )
                    fit.save()
                    group.goal.add(fit)

            #tags
            for tag in Tag.objects.all():
                if random.randint(1, 100) <= 3:
                    group.tags.add(tag)
                    group.prime_tag = tag
                    group.save()
