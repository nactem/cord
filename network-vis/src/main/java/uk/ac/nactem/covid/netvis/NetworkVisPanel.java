package uk.ac.nactem.covid.netvis;

import java.util.Set;
import org.apache.wicket.Component;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.markup.head.CssHeaderItem;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.model.IModel;

import org.apache.wicket.request.mapper.parameter.PageParameters;
import org.apache.wicket.request.resource.PackageResourceReference;
import org.apache.wicket.util.string.StringValue;
import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;
import uk.ac.nactem.wicket.endpoint.AjaxJsonEndpoint;
import uk.ac.nactem.wicket.html.vis.VisPanel;

/**
 *
 * @author sam
 */
public class NetworkVisPanel extends VisPanel {
    
    private class DataEndpoint extends AjaxJsonEndpoint {
        
        public DataEndpoint() {
            super(CallbackParameter.explicit("id"));
        }
        
        @Override
        protected String sendResponse(PageParameters pp) {
            if (this.hasParam("id") && !this.getParam("id").isEmpty()) {
                return jsWriter.writeValueAsString(
                        model.getObject().expandRelations(this.getParam("id").toInt()));
            }
            return jsWriter.writeValueAsString(model.getObject());
        }
    }
    
    private final IModel<NetworkVisDataProvider> model;
    private String initScript;
    private Component chart;
    private Callback link;
    private DataEndpoint ep;
    private final Set<NetworkVisEventListener> listeners = new java.util.HashSet<>();
    
    private final JSWriter jsWriter = new JSWriter();
    
    public NetworkVisPanel(String id, IModel<NetworkVisDataProvider> model) {
        super(id);
        this.model = model;
    }
    
    @Override
    protected void onInitialize() {
        super.onInitialize();
        add(chart = new WebMarkupContainer("chart").setOutputMarkupId(true));
        chart.getMarkupId();
        link = new Callback(CallbackParameter.explicit("id")) {
            @Override
            public void respond(AjaxRequestTarget target) {
                if (hasParam("id")) {
                    NetworkVisPanel.this.onClick(target,
                        getParam("id"));
                }
            }
        };
        add(link);
        ep = new DataEndpoint();
        add(ep);
    }
    
    @Override
    protected void onBeforeRender() {
        super.onBeforeRender();
        initScript = "var net = new simpleCollapsibleGraph.simpleCollapsibleGraph(\"#"+chart.getMarkupId()+
                "\", 800, 800,"+dataFunc()+","+clickFunc()+", 0.1, 0.0);\n"+
                "net.createSimpleCollapsibleGraph(null, 0.1,0.0);";
        //initScript = "new Network({onclick:"+clickFunc()+",data_callback:"+dataUrl()
        //        +"}).chart('#" + chart.getMarkupId() + "');";
    }
        
    @Override
    public void renderHead(IHeaderResponse response) {
        PackageResourceReference jsFile =
                    new PackageResourceReference(NetworkVisPanel.class, "network2.js");
        JavaScriptHeaderItem jsItem = JavaScriptHeaderItem.forReference(jsFile);
        PackageResourceReference contextMenuFile =
                    new PackageResourceReference(NetworkVisPanel.class, "d3-context-menu.js");
        JavaScriptHeaderItem contextMenuItem = JavaScriptHeaderItem.forReference(contextMenuFile);
        PackageResourceReference contextMenuCssFile =
                    new PackageResourceReference(NetworkVisPanel.class, "d3-context-menu.css");
        CssHeaderItem contextMenuCss = CssHeaderItem.forReference(contextMenuCssFile);
        response.render(contextMenuCss);
        response.render(contextMenuItem);
        response.render(jsItem);
    }
    
    public NetworkVisPanel addListener(NetworkVisEventListener listener) {
        this.listeners.add(listener);
        return this;
    }
    
    protected void onClick(AjaxRequestTarget target, StringValue id) {
        for (NetworkVisEventListener l : listeners) {
            l.onNodeClick(target, id.toInt());
        }
    }
    
    private CharSequence clickFunc () {
        return link.getCallbackFunction((CallbackParameter[])null);
    }
    
    private CharSequence dataFunc () {
        return ep.getCallbackFunction((CallbackParameter[])null);
    }
    
    public void init(AjaxRequestTarget target) {
        target.appendJavaScript(initScript);
    }
}
