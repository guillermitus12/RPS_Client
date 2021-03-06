import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {ActivatedRoute, Params } from '@angular/router';

/**
 * Data Components
 */
import { Project } from './project';
import { Dataset } from './dataset';


// Services
import { UploadFileService } from '../../../services/upload-file.service';
import { SharedDatasetService } from '../../../services/shared-dataset.service';
import { ProjectService } from '../../../services/get-projects.service';
import { UserService } from "../../../services/user.service";
import {User} from './user';
import { DatasetService } from '../../../services/dataset.service';
import { OrdinationService } from '../../../services/ordination.service';
import { DistanceService } from '../../../services/distance.service';

declare var $: any;

@Component({
  selector: 'app-navbar-dashboard',
  templateUrl: './navbar-dashboard.component.html',
  styleUrls: ['./navbar-dashboard.component.css']
})
export class NavbarDashboardComponent implements OnInit {


  subscription: Subscription;
  filesToUpload: File[];
  project_list = [];
  
  idUser = '';
  dataset_list = [];
  distance_list = [];
  datasetEnable = true;
  distanceEnable = false;
  processing = false;
  new_notification = 0;
  new_in_progress = 0;
  error_update_msg = '';
  nick = '';

  project = new Project('', '', '');
  dataset = new Dataset('', '',1);
  user = new User('','','','','','','','','','');

  error_msg = '';
  invalid = false;

  constructor(
    private uploadService: UploadFileService,
    private sharedDatasetService: SharedDatasetService,
    private route: ActivatedRoute,
    private datasetService: DatasetService,
    private userService: UserService,
    private projectService: ProjectService,
    private ordinationService: OrdinationService,
    private distanceService: DistanceService
  ) { 

    $(document).ready(function() {
        $('#notifications').on('click', '.view', function() { 
            var tabID = $(this).parents('li').attr('id');
            var IsDataset = $(this).parents('li').attr('isDataset');
            var IsDistance = $(this).parents('li').attr('isDistance');
            var IsOrdination = $(this).parents('li').attr('isOrdination');
            var node_tree = $(this).parents('li').attr('node')
            console.log('Datos del LI: '+tabID);
            console.log(node_tree);
            if(IsDataset){
                datasetService.getDatasetsById(tabID).then((result) =>{
                    if(node_tree){
                        result = JSON.parse(result);
                        result.node_tree = node_tree;
                        result = JSON.stringify(result);
                    }
                    console.log("comparto el dataset: "+ result);
                    sharedDatasetService.sendAnalysis(result);
                  });
            }
            if(IsDistance){
                distanceService.getDistanceById(tabID).then((result) =>{
                    if(node_tree){
                        result = JSON.parse(result);
                        result.node_tree = node_tree;
                        result = JSON.stringify(result);
                    }
                    sharedDatasetService.setDistance(result);
                  });
            }

            if(IsOrdination){
                ordinationService.getOrdinationById(tabID).then((result) =>{
                    if(node_tree){
                        result = JSON.parse(result);
                        result.node_tree = node_tree;
                        result = JSON.stringify(result);
                    }
                    sharedDatasetService.setOrdination(result);
                  });
            }
            $('#'+tabID).remove();
            sharedDatasetService.setNotificationCount(1);
        });
    });

    this.subscription = this.sharedDatasetService.getNotificationCount().subscribe(
        () => {
            this.new_notification--;
        }
    )

    this.subscription = this.sharedDatasetService.isFinishedAnalisys().subscribe(
         params => {
        if(params.dataset_name){
            this.addNotificationDataset(params);
        }
        if(params.distance_name){
            this.addNotificationDistance(params);
        }
        if(params.ordination_name){
            this.addNotificationOrdination(params);
        }
    });

    this.subscription = this.sharedDatasetService.isNewAnalisys().subscribe(
        params => {
       if(params.isAnalyze){
           this.addInProcessDataset(params);
       }
       if(params.isDistance){
           this.addInProcessDistance(params);
       }
       if(params.isOrdination){
           this.addInProcessOrdination(params);
       }
   });
  }

  @ViewChild('form') form;

  openPopUp(){
    this.invalid = false;
    this.processing = false;
    this.project = new Project('','','');
    this.dataset = new Dataset('','',1);
    this.filesToUpload = [];
  }

  addNotificationDataset(params) {
    this.new_notification++;
    if(this.new_in_progress > 0){
        this.new_in_progress--;
        $('#'+params.name).remove();
    }
    if(params.node_tree) {
        $('#notifications').append('<li  id="'+params.dataset_id +'"  isDataset="true" node="'+params.node_tree+'" ><a> New Analisys: '+params.dataset_name+'   <span > <button class="btn btn-info btn-xs view "   (click)="viewDataset()"> View </button> </span>  </a> </li>'); 
  
    }else{
          $('#notifications').append('<li id="'+params.dataset_id +'"  isDataset="true" ><a> New Analisys: '+params.dataset_name+'   <span > <button class="btn btn-info btn-xs view "   (click)="viewDataset()"> View </button> </span>  </a> </li>'); 
    }
  }
  addNotificationOrdination(params) {
    if(this.new_in_progress > 0){
        this.new_in_progress--;
        $('#'+params.name).remove();
    }
    this.new_notification++;
    if(params.node_tree) {
        $('#notifications').append('<li  id="'+params.ordination_id +'" isOrdination="true" node="'+params.node_tree+'" ><a> New Ordination: '+params.ordination_name+'  <span><button class="btn btn-info btn-xs view" (click)="viewDataset()"> View </button> </span>  </a> </li>'); 
    }
    else{
        $('#notifications').append('<li id="'+params.ordination_id +'" isOrdination="true" ><a> New Ordination: '+params.ordination_name+'  <span><button class="btn btn-info btn-xs view" (click)="viewDataset()"> View </button> </span>  </a> </li>'); 
    }
  }
  addNotificationDistance(params) {
    if(this.new_in_progress > 0){
        this.new_in_progress--;
        $('#'+params.name).remove();
    }
    this.new_notification++;

    if(params.node_tree) {
        $('#notifications').append('<li  id="'+params.distance_id +'" isDistance="true" node="'+params.node_tree+'" ><a> New Distance: '+params.distance_name+'  <span> <button class="btn btn-info btn-xs view" (click)="viewDataset()"> View </button>  </a> </span> </li>'); 
    }
    else{
        $('#notifications').append('<li id="'+params.distance_id +'" isDistance="true" ><a> New Distance: '+params.distance_name+'  <span> <button class="btn btn-info btn-xs view" (click)="viewDataset()"> View </button>  </a> </span> </li>'); 
    }
    }
  

  addInProcessDataset(params) {
    this.new_in_progress++;
    $('#in_progress').append('<li id="'+params.dataset_name +'"  isDataset="true"  ><a>Analisys in progress : '+params.dataset_name+'    </a> </li>'); 
  }
  addInProcessDistance(params) {
    this.new_in_progress++;
    $('#in_progress').append('<li id="'+params.distance_name +'" isDistance="true" ><a>Distance in progress : '+params.distance_name+'  </a> </li>'); 
  }
  addInProcessOrdination(params) {
    this.new_in_progress++;
    $('#in_progress').append('<li id="'+params.ordination_name +'" isOrdenation="true" ><a>Ordination in progress : '+params.ordination_name+'  </a> </li>'); 
  }

  loadPendingAnalisys(){
      this.loadPendingDatasets();
      this.loadPendingDistances();
      this.loadPendingOrdinations();
  }

  loadPendingDatasets(){
      this.project_list.forEach(element => {
        this.datasetService.getPendingDatasets(element.project_id).then( params => {
            params = JSON.parse(params);
            params.forEach(dataset => {
                this.addNotificationDataset(dataset);
            });           
        });
      });
      
  }

  loadPendingDistances(){
    this.project_list.forEach(element => {
        this.distanceService.getPendingDistances(element.project_id).then( params => {
            params = JSON.parse(params);
            params.forEach(distance => {
                this.addInProcessDistance(distance);
            });
        });
      });

  }

  closeSession(){
    this.userService.closeSession("").then(response => {
        console.log(response);
    });
  }

  loadPendingOrdinations(){
    this.project_list.forEach(element => {
        this.ordinationService.getPendingOrdinations(element.project_id).then( params => {
            params = JSON.parse(params);
            params.forEach(ordination => {
                this.addNotificationOrdination(ordination);
            });
        });
      });
  }


  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.idUser = params['id'];
      this.user.id = this.idUser;
   }); 
    this.initialize();
  }

  initialize(): void {
    this.getProject();
    this.getUser();
    
  }

  getProject(): void {
    this.projectService.getProjectsByData(this.idUser).then
      ( result => {
          this.project_list = result;
          this.loadPendingAnalisys();
          this.sharedDatasetService.setProjects(result);
       });
  }

  
  getUser(){
      this.userService.getUserById(this.idUser).then(
          params => {
              this.user.name = params.first_name;
              this.user.old_pass = params.password;
              this.user.institution = params.institution;
              this.user.area = params.area;
              this.user.email = params.email_address;
              this.nick = params.nick;
              this.user.last_name = params.last_name;
          }
      )
  }



confirmProject() {
    this.invalid = this.invalidProject();
    if(!this.invalid){
        this.uploadService.makeProjectRequest({ name_project:  this.project.name, description: this.project.description, id_user: this.idUser }).subscribe(data => {
            if (data.error == 'ok') {
                this.project_list.push(data.result);
                this.project = new Project('','','');
                this.filesToUpload = [];
                this.invalid = false;
                this.sharedDatasetService.setNameProject(data.result);
                document.getElementById('hideAddProject').click();
            }else {
                this.invalid = true;
                this.error_msg = data.error;
            }
        }, (error) => {
            console.log(error);
        });
    }
}

    confirmUserUpdate(){
        if(this.user.new_pass != '' && this.user.confirm_pass != ''){
            if(this.user.new_pass != this.user.confirm_pass){
                alert("Invalid password");
            }
        }else{
            this.user.new_pass = this.user.old_pass;
        }
        this.userService.updateUser(this.user).subscribe(params => {
            if(params.result != 'error'){
                document.getElementById('hideUpdateProfile').click();
            }
            else{
                this.error_update_msg = params.result;
            }
        })
    }

    loadDataset(idProject){
        this.datasetService.getDatasetsByProject(idProject).then( (result) =>{
            this.dataset_list = result;
        })
    }

    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>> fileInput.target.files;
    }

    upload() {
        this.invalid = this.invalidDataset();
        if(!this.invalid){
            this.processing = true;
            this.invalid = false;
            this.uploadService.makeFileRequest([], this.dataset, this.filesToUpload).then((result) => {
                if(result['error'] == undefined){
                    this.dataset = new Dataset('','',1);
                    this.sharedDatasetService.sendMessage(result);
                    this.processing = false;
                    this.filesToUpload = [];
                    this.invalid = false;
                    document.getElementById('hideAddDataset').click();
                }
                else{
                    this.error_msg = result['error'];
                    this.invalid = true;
                    this.processing = false;
                }
            }, () => {
                    this.processing = false;
                    this.error_msg = 'Please, add a new dataset file.';
                    ;
                    this.invalid = true;
                });
        }
    }

    invalidProject(){
        if(this.project.name.length == 0){
            this.error_msg = 'Project name is empty.'
            return true;
        }
        if(this.project.description.length == 0){
            this.error_msg = 'Project description is empty.'
            return true;
        }
        return false;
    }

    invalidDataset(){
        if(this.dataset.project_for_data === ''){
            this.error_msg = 'Please, select a project.'
            return true;
        }
        if(this.dataset.dataset_name.length == 0){
            this.error_msg = 'Dataset name is empty.'
            return true;
        }
        return false;
    }

    downloadPDF(){
        this.uploadService.downloadPDF().subscribe(
            (res) => {
            var fileURL = URL.createObjectURL(res);
            window.open(fileURL);
            }
        );
    }
}
