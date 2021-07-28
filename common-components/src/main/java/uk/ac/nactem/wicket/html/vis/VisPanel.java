package uk.ac.nactem.wicket.html.vis;

import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.markup.head.OnLoadHeaderItem;
import org.apache.wicket.markup.html.panel.Panel;
import org.apache.wicket.model.IModel;
import org.apache.wicket.request.resource.PackageResourceReference;
import uk.ac.nactem.wicket.ajax.AbstractAjaxCallback;
import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;

/**
 *
 * @author sam
 */
public abstract class VisPanel extends Panel {
    
    protected abstract class Callback extends AbstractAjaxCallback {
        
        public Callback() {
            super((CallbackParameter[]) null);
        }
        
        public Callback(CallbackParameter... params) {
            super(params);
        }
    }
        
    private String javascriptFile;
    
    public VisPanel(String id) {
        this(id, null, null);
    }
    
    public VisPanel(String id, IModel<?> model) {
        this(id, model, null);
    }
    
    public VisPanel(String id, String javascriptFile) {
        this(id, null, javascriptFile);
    }
    
    public VisPanel(String id, IModel<?> model, String javascriptFile) {
        super(id, model);
        this.javascriptFile = javascriptFile;
    }
    
    @Override
    public void renderHead(IHeaderResponse response) {
        if (javascriptFile != null) {
            PackageResourceReference jsFile =
                        new PackageResourceReference(getClass(), javascriptFile);
            JavaScriptHeaderItem jsItem = JavaScriptHeaderItem.forReference(jsFile);
            response.render(jsItem);
        }
        CharSequence initScript = initScript();
        if (initScript != null) {
            response.render(OnLoadHeaderItem.forScript(initScript));
        }
    }
    
    protected CharSequence initScript () {
        return null;
    }
        
}
