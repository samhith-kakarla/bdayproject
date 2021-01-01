from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .serializers import *

import stripe
import environ

env = environ.Env()
environ.Env.read_env()

stripe.api_key = env("STRIPE_API_KEY")

# OVERVIEW

@api_view(['GET'])
def apiOverview(request):
    # Returns all API Endpoints
    return Response(data={
        "Users": {
            "Register User": "auth/users/", 
            "Get User Info": "auth/users/me/", 
            "Obtain JWT (Get Access and Refresh Token)": "auth/jwt/create", 
            "Refresh JWT (Get New Access Token)": "auth/jwt/refresh", 
            "Verify JWT (Send Token)": "auth/jwt/verify", 
        },
        "Twins": {
            "Get Matched Twins": "get_twins/<str:birthday>/", 
            "Set Twin Match": "set_twin_match/<int:pk>/", 
            "Add New Twin": "add_twin/", 
            "Update Twin with Images": "update_twin/<int:pk>/", 
            "Get My Twins": "my_twins/",  
        }, 
        "Cakes": {
            "Search Cakes by Tags": "cakes/?tags=tag1,tag2,tag3,etc/",
        }, 
        "Gifts": {
            "Search Gifts by Tags": "gifts/?tags=tag1,tag2,tag3,etc/",
        }, 
        "Purchases": {
            "Send Purchase Order to DB": "send_order/",
            "Make Payment to Stripe": "make_payment/"
        },
    })


# TWINS API

@api_view(['GET'])
def getMatchedTwins(request, birthday):
    twins = Twin.objects.filter(birthday=birthday)
    serializer = GetTwinsSerializer(twins, many=True)

    return Response(serializer.data)

@api_view(['POST'])
def addTwin(request):
    twin = request.data
    serializer = CreateTwinSerializer(data=twin)

    if serializer.is_valid(raise_exception=True):
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(data={
            "failure": "Twin not added"
        })

@api_view(['GET'])
def getMyTwins(request):
    twins = Twin.objects.filter(owner=request.user)
    serializer = GetTwinsSerializer(twins, many=True)

    return Response(serializer.data)

@api_view(['POST'])
def setTwinMatch(request, pk):
    pass


# CAKES API

@api_view(['GET'])
def getCakesByTagSearch(request):
    tagParams = request.query_params.get("tags", None)
    tags = []
    allCakes = []

    if tagParams is not None:
        for tag in tagParams.split(","):
            tags.append(str(tag))

    for tag in tags:
        cakes = Cake.objects.filter(tag=tag)
        allCakes += cakes

    serializer = GetCakesSerializer(allCakes, many=True) 

    return Response(serializer.data)


# GIFTS API

@api_view(['GET'])
def getGiftsByTagSearch(request):
    tagParams = request.query_params.get("tags", None)
    tags = []
    allGifts = []

    if tagParams is not None:
        for tag in tagParams.split(","):
            tags.append(str(tag))

    for tag in tags:
        gifts = Gift.objects.filter(tag=tag)
        allGifts += gifts

    serializer = GetGiftsSerializer(allGifts, many=True)

    return Response(serializer.data)


# PURCHASE API

@api_view(['POST'])
def sendOrder(request):
    purchase = request.data
    serializer = PurchaseSerializer(data=purchase)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(data={
            "failure": "purchase not sent"
        })

@api_view(['POST'])
def makeStripePayment(request):
    payment_intent = stripe.PaymentIntent.create(
        amount=request.data["amount"],
        currency="usd", 
        payment_method_types=["card"], 
        receipt_email=request.data["email"],
    )

    return Response(data=payment_intent, status=status.HTTP_200_OK)






